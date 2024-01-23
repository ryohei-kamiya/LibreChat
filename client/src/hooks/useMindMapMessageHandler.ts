import { v4 } from 'uuid';
import { parseConvo, getResponseSender } from 'librechat-data-provider';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import type { TMessage, TSubmission, TEndpointOption } from 'librechat-data-provider';
import type { TAskFunction } from '~/common';
import useMindMapUserKey from './MindMapInput/useMindMapUserKey';
import store from '~/store';

export default function useMindMapMessageHandler(
  index = 0,
  paramId: string | undefined,
  nodeId: string | undefined = undefined,
) {
  const [latestMindMapMessage, setLatestMindMapMessage] = useRecoilState(
    store.latestMindMapMessageFamily(nodeId ?? store.initNodeId),
  );
  const setSiblingIdx = useSetRecoilState(
    store.mindMapMessagesSiblingIdxFamily(latestMindMapMessage?.parentMessageId),
  );
  const currentMindMapConversation = useRecoilValue(store.mindMapConversation) || {
    endpoint: null,
  };
  const setSubmission = useSetRecoilState(store.submissionByNodeId(nodeId ?? store.initNodeId));
  const [isSubmitting, setIsSubmitting] = useRecoilState(
    store.isSubmittingFamily(nodeId ?? store.initNodeId),
  );
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const [mindMapMessages, setMindMapMessages] = useRecoilState(store.mindMapMessages);
  const { endpoint } = currentMindMapConversation;
  const { getExpiry } = useMindMapUserKey(endpoint ?? '');

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
    if (!!isSubmitting || text === '') {
      return;
    }

    if (endpoint === null) {
      console.error('No endpoint available');
      return;
    }

    conversationId = conversationId ?? currentMindMapConversation?.conversationId;
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
    const convo = parseConvo({ endpoint, conversation: currentMindMapConversation });
    const endpointOption = {
      ...convo,
      endpoint,
      key: getExpiry(),
    } as TEndpointOption;
    const responseSender = getResponseSender(endpointOption);

    let currentMessages: TMessage[] | null = mindMapMessages ?? [];

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

    // construct the placeholder response message
    const generation = editedText ?? latestMindMapMessage?.text ?? '';
    const responseText = isEditOrContinue ? generation : '';

    const responseMessageId = editedMessageId ?? latestMindMapMessage?.messageId ?? null;
    const initialResponse: TMessage = {
      sender: responseSender,
      text: responseText,
      parentMessageId: isRegenerate ? messageId : fakeMessageId,
      messageId: responseMessageId ?? `${isRegenerate ? messageId : fakeMessageId}_`,
      conversationId,
      unfinished: false,
      isCreatedByUser: false,
      isEdited: isEditOrContinue,
      error: false,
    };

    if (isContinued && currentMessages) {
      currentMessages = currentMessages.filter((msg) => msg.messageId !== responseMessageId);
    }

    const submission: TSubmission = {
      conversation: {
        ...currentMindMapConversation,
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
      setMindMapMessages([...submission.messages, initialResponse]);
    } else {
      setMindMapMessages([...submission.messages, currentMsg, initialResponse]);
    }
    setLatestMindMapMessage(initialResponse);
    setSubmission(submission);
  };

  const regenerate = ({ parentMessageId }) => {
    const parentMessage = mindMapMessages?.find((element) => element.messageId == parentMessageId);

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
      console.error('Failed to regenerate the message: latestMessage not found.');
      return;
    }

    const parentMessage = mindMapMessages?.find(
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

  return {
    ask,
    regenerate,
    stopGenerating,
    handleStopGenerating,
    handleRegenerate,
    handleContinue,
    endpointsConfig,
    latestMindMapMessage,
    isSubmitting,
    mindMapMessages,
  };
}
