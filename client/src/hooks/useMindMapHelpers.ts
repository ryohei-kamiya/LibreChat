import { v4 } from 'uuid';
import React, { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys, parseCompactConvo } from 'librechat-data-provider';
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil';
import { useGetMessagesByConvoId, useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import type {
  TMessage,
  TSubmission,
  TEndpointOption,
  TConversation,
  TEndpointsConfig,
  TGetConversationsResponse,
} from 'librechat-data-provider';
import type { TAskFunction } from '~/common';
import useSetFilesToDelete from './useSetFilesToDelete';
import useMindMapGetSender from './MindMapConversations/useMindMapGetSender';
import { useAuthContext } from './AuthContext';
import useMindMapUserKey from './MindMapInput/useMindMapUserKey';
import useMindMapNodeHandler from './useMindMapNodeHandler';
import useNewMindMapConvo from './useNewMindMapConvo';
import store from '~/store';

// this to be set somewhere else
export default function useMindMapHelpers(
  index = 0,
  paramId: string | undefined,
  nodeId: string | undefined = undefined,
) {
  const { data: endpointsConfig = {} as TEndpointsConfig } = useGetEndpointsQuery();
  const { files, isSubmitting, setFiles, setShowStopButton, setFilesLoading, setIsSubmitting } =
    useMindMapNodeHandler(nodeId);
  const setFilesToDelete = useSetFilesToDelete();
  const getSender = useMindMapGetSender();

  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthContext();

  const { newMindMapConversation } = useNewMindMapConvo(index);
  const { useCreateMindMapConversationAtom } = store;
  const { mindMapConversation, setMindMapConversation } = useCreateMindMapConversationAtom(index);
  const { conversationId, endpoint, endpointType } = mindMapConversation ?? {};

  const queryParam = paramId === 'new' ? paramId : conversationId ?? paramId ?? '';

  /* Messages: here simply to fetch, don't export and use `getMessages()` instead */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _messages } = useGetMessagesByConvoId(conversationId ?? '', {
    enabled: isAuthenticated,
  });

  const resetLatestMindMapMessage = useResetRecoilState(
    store.latestMindMapMessageFamily(nodeId ?? store.initNodeId),
  );
  const [latestMindMapMessage, setLatestMindMapMessage] = useRecoilState(
    store.latestMindMapMessageFamily(nodeId ?? store.initNodeId),
  );
  const setSiblingIdx = useSetRecoilState(
    store.mindMapMessagesSiblingIdxFamily(latestMindMapMessage?.parentMessageId ?? null),
  );

  const setMessages = useCallback(
    (messages: TMessage[]) => {
      queryClient.setQueryData<TMessage[]>([QueryKeys.messages, queryParam], messages);
    },
    // [conversationId, queryClient],
    [queryParam, queryClient],
  );

  const addConvo = useCallback(
    (convo: TConversation) => {
      const convoData = queryClient.getQueryData<TGetConversationsResponse>([
        QueryKeys.allConversations,
        { pageNumber: '1', active: true },
      ]) ?? { conversations: [] as TConversation[], pageNumber: '1', pages: 1, pageSize: 14 };

      let { conversations: convos, pageSize = 14 } = convoData;
      pageSize = Number(pageSize);
      convos = convos.filter((c) => c.conversationId !== convo.conversationId);
      convos = convos.length < pageSize ? convos : convos.slice(0, -1);

      const conversations = [
        {
          ...convo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...convos,
      ];

      queryClient.setQueryData<TGetConversationsResponse>(
        [QueryKeys.allConversations, { pageNumber: '1', active: true }],
        {
          ...convoData,
          conversations,
        },
      );
    },
    [queryClient],
  );

  const invalidateConvos = useCallback(() => {
    queryClient.invalidateQueries([QueryKeys.allConversations, { active: true }]);
  }, [queryClient]);

  const getMessages = useCallback(() => {
    return queryClient.getQueryData<TMessage[]>([QueryKeys.messages, queryParam]);
  }, [queryParam, queryClient]);

  /* Conversation */
  // const setActiveConvos = useSetRecoilState(store.activeConversations);

  // const setConversation = useCallback(
  //   (convoUpdate: TConversation) => {
  //     _setConversation(prev => {
  //       const { conversationId: convoId } = prev ?? { conversationId: null };
  //       const { conversationId: currentId } = convoUpdate;
  //       if (currentId && convoId && convoId !== 'new' && convoId !== currentId) {
  //         // for now, we delete the prev convoId from activeConversations
  //         const newActiveConvos = { [currentId]: true };
  //         setActiveConvos(newActiveConvos);
  //       }
  //       return convoUpdate;
  //     });
  //   },
  //   [_setConversation, setActiveConvos],
  // );
  const { getExpiry } = useMindMapUserKey(endpoint ?? '');
  const setSubmission = useSetRecoilState(store.submissionByNodeId(nodeId ?? store.initNodeId));

  const ask: TAskFunction = (
    { text, parentMessageId = null, conversationId = null, messageId = null },
    {
      editedText = null,
      editedMessageId = null,
      isRegenerate = false,
      isContinued = false,
      isEdited = false,
    } = {},
  ) => {
    console.log('ask', text, parentMessageId);
    setShowStopButton(true);
    if (!!isSubmitting || text === '') {
      return;
    }

    if (endpoint === null) {
      console.error('No endpoint available');
      return;
    }

    conversationId = conversationId ?? mindMapConversation?.conversationId ?? null;
    if (conversationId == 'search') {
      console.error('cannot send any message under search view!');
      return;
    }

    if (isContinued && !latestMindMapMessage) {
      console.error('cannot continue AI message without latestMindMapMessage!');
      return;
    }

    const isEditOrContinue = isEdited || isContinued;

    // set the endpoint option
    const convo = parseCompactConvo({
      endpoint,
      endpointType,
      conversation: mindMapConversation ?? {},
    });

    const { modelDisplayLabel } = endpointsConfig?.[endpoint ?? ''] ?? {};
    const endpointOption = {
      ...convo,
      endpoint,
      endpointType,
      modelDisplayLabel,
      key: getExpiry(),
      n: 3,
    } as TEndpointOption;
    const responseSender = getSender({ model: mindMapConversation?.model, ...endpointOption });

    let currentMessages: TMessage[] | null = getMessages() ?? [];

    // construct the query message
    // this is not a real messageId, it is used as placeholder before real messageId returned
    text = text.trim();
    const fakeMessageId = v4();
    parentMessageId = parentMessageId || latestMindMapMessage?.messageId || store.initNodeId;

    if (conversationId == 'new') {
      parentMessageId = store.initNodeId;
      currentMessages = [];
      conversationId = null;
    }
    const currentMsg: TMessage = {
      text,
      sender: 'User',
      isCreatedByUser: true,
      parentMessageId,
      conversationId,
      messageId: isContinued && messageId ? messageId : fakeMessageId,
      error: false,
    };

    const parentMessage = currentMessages?.find(
      (msg) => msg.messageId === latestMindMapMessage?.parentMessageId,
    );
    const reuseFiles = isRegenerate && parentMessage?.files;
    if (reuseFiles && parentMessage.files?.length) {
      currentMsg.files = parentMessage.files;
      setFiles(new Map());
      setFilesToDelete({});
    } else if (files.size > 0) {
      currentMsg.files = Array.from(files.values()).map((file) => ({
        file_id: file.file_id,
        filepath: file.filepath,
        type: file.type || '', // Ensure type is not undefined
        height: file.height,
        width: file.width,
      }));
      setFiles(new Map());
      setFilesToDelete({});
    }

    // construct the placeholder response message
    const generation = editedText ?? latestMindMapMessage?.text ?? '';
    const responseText = isEditOrContinue ? generation : '';

    const responseMessageId = editedMessageId ?? latestMindMapMessage?.messageId ?? null;
    const initialResponse: TMessage = {
      sender: responseSender,
      text: responseText,
      endpoint: endpoint ?? '',
      parentMessageId: isRegenerate ? messageId : fakeMessageId,
      messageId: responseMessageId ?? `${isRegenerate ? messageId : fakeMessageId}_`,
      conversationId,
      unfinished: false,
      isCreatedByUser: false,
      isEdited: isEditOrContinue,
      error: false,
    };

    if (isContinued && !!currentMessages) {
      currentMessages = currentMessages.filter((msg) => msg.messageId !== responseMessageId);
    }

    const submission: TSubmission = {
      conversation: {
        ...mindMapConversation,
        conversationId,
      },
      endpointOption,
      message: {
        ...currentMsg,
        generation,
        responseMessageId,
        overrideParentMessageId: isRegenerate ? messageId : null,
      },
      messages: currentMessages,
      isEdited: isEditOrContinue,
      isContinued,
      isRegenerate,
      initialResponse,
    };

    if (isRegenerate) {
      setMessages([...submission.messages, initialResponse]);
    } else {
      setMessages([...submission.messages, currentMsg, initialResponse]);
    }
    setLatestMindMapMessage(initialResponse);
    setSubmission(submission);
  };

  const regenerate = ({ parentMessageId }) => {
    const messages = getMessages();
    const parentMessage = messages?.find((element) => element.messageId == parentMessageId);

    if (parentMessage && parentMessage.isCreatedByUser) {
      ask({ ...parentMessage }, { isRegenerate: true });
    } else {
      console.error(
        'Failed to regenerate the message: parentMessage not found or not created by user.',
      );
    }
  };

  const continueGeneration = () => {
    if (!latestMindMapMessage) {
      console.error('Failed to regenerate the message: latestMindMapMessage not found.');
      return;
    }

    const messages = getMessages();

    const parentMessage = messages?.find(
      (element) => element.messageId == latestMindMapMessage.parentMessageId,
    );

    if (parentMessage && parentMessage.isCreatedByUser) {
      ask({ ...parentMessage }, { isContinued: true, isRegenerate: true, isEdited: true });
    } else {
      console.error(
        'Failed to regenerate the message: parentMessage not found, or not created by user.',
      );
    }
  };

  const stopGenerating = () => {
    setSubmission(null);
  };

  const handleStopGenerating = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    stopGenerating();
  };

  const handleRegenerate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const parentMessageId = latestMindMapMessage?.parentMessageId;
    if (!parentMessageId) {
      console.error('Failed to regenerate the message: parentMessageId not found.');
      return;
    }
    regenerate({ parentMessageId });
  };

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    continueGeneration();
    setSiblingIdx(0);
  };

  const [showBingToneSetting, setShowBingToneSetting] = useRecoilState(
    store.showBingToneSettingFamily(index),
  );

  const initMindMapNodeStates = () => {
    resetLatestMindMapMessage();
    setFiles(new Map());
    setShowStopButton(false);
    setFilesLoading(false);
    setIsSubmitting(false);
    setSubmission(null);
  };

  return {
    newMindMapConversation,
    mindMapConversation,
    setMindMapConversation,
    addConvo,
    // getConvos,
    // setConvos,
    getMessages,
    setMessages,
    setSiblingIdx,
    latestMindMapMessage,
    setLatestMindMapMessage,
    resetLatestMindMapMessage,
    ask,
    index,
    regenerate,
    stopGenerating,
    handleStopGenerating,
    handleRegenerate,
    handleContinue,
    invalidateConvos,
    initMindMapNodeStates,
  };
}
