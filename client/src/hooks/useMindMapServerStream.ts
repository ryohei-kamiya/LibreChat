import { useEffect } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import {
  /* @ts-ignore */
  SSE,
  createPayload,
  tMessageSchema,
  tConversationSchema,
} from 'librechat-data-provider';
import { useGetUserBalance, useGetStartupConfig } from 'librechat-data-provider/react-query';
import type { TResPlugin, TMessage, TConversation, TSubmission } from 'librechat-data-provider';
import useMindMapConversations from './useMindMapConversations';
import { useAuthContext } from './AuthContext';
import useMindMapNodeHandler from './useMindMapNodeHandler';

import store from '~/store';

type TResData = {
  plugin: TResPlugin;
  final?: boolean;
  initial?: boolean;
  requestMessage: TMessage;
  responseMessage: TMessage;
  conversation: TConversation;
};

export default function useMindMapServerStream(submission: TSubmission | null) {
  const setMindMapMessages = useSetRecoilState(store.mindMapMessages);
  const { setIsSubmitting } = useMindMapNodeHandler(store.initNodeId);
  const setMindMapConversation = useSetRecoilState(store.mindMapConversation);
  const resetLatestMindMapMessage = useResetRecoilState(
    store.latestMindMapMessageFamily(store.initNodeId),
  );
  const { token, isAuthenticated } = useAuthContext();

  const { data: startupConfig } = useGetStartupConfig();
  const { refreshMindMapConversations } = useMindMapConversations();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.checkBalance,
  });

  const messageHandler = (data: string, submission: TSubmission) => {
    const {
      messages,
      message,
      plugin,
      plugins,
      initialResponse,
      isRegenerate = false,
    } = submission;

    if (isRegenerate) {
      setMindMapMessages([
        ...messages,
        {
          ...initialResponse,
          text: data,
          parentMessageId: message?.overrideParentMessageId ?? null,
          messageId: message?.overrideParentMessageId + '_',
          plugin: plugin ?? null,
          plugins: plugins ?? [],
          submitting: true,
          // unfinished: true
        },
      ]);
    } else {
      setMindMapMessages([
        ...messages,
        message,
        {
          ...initialResponse,
          text: data,
          parentMessageId: message?.messageId,
          messageId: message?.messageId + '_',
          plugin: plugin ?? null,
          plugins: plugins ?? [],
          submitting: true,
          // unfinished: true
        },
      ]);
    }
  };

  const cancelHandler = (data: TResData, submission: TSubmission) => {
    const { requestMessage, responseMessage, conversation } = data;
    const { messages, isRegenerate = false } = submission;

    // update the messages
    if (isRegenerate) {
      setMindMapMessages([...messages, responseMessage]);
    } else {
      setMindMapMessages([...messages, requestMessage, responseMessage]);
    }
    setIsSubmitting(false);

    // refresh title
    if (requestMessage.parentMessageId == store.initNodeId) {
      setTimeout(() => {
        refreshMindMapConversations();
      }, 2000);

      // in case it takes too long.
      setTimeout(() => {
        refreshMindMapConversations();
      }, 5000);
    }

    setMindMapConversation((prevState) => ({
      ...prevState,
      ...conversation,
    }));
  };

  const createdHandler = (data: TResData, submission: TSubmission) => {
    const { messages, message, initialResponse, isRegenerate = false } = submission;

    if (isRegenerate) {
      setMindMapMessages([
        ...messages,
        {
          ...initialResponse,
          parentMessageId: message?.overrideParentMessageId ?? null,
          messageId: message?.overrideParentMessageId + '_',
          submitting: true,
        },
      ]);
    } else {
      setMindMapMessages([
        ...messages,
        message,
        {
          ...initialResponse,
          parentMessageId: message?.messageId,
          messageId: message?.messageId + '_',
          submitting: true,
        },
      ]);
    }

    const { conversationId } = message;
    setMindMapConversation((prevState) =>
      tConversationSchema.parse({
        ...prevState,
        conversationId,
      }),
    );
    resetLatestMindMapMessage();
  };

  const finalHandler = (data: TResData, submission: TSubmission) => {
    const { requestMessage, responseMessage, conversation } = data;
    const { messages, isRegenerate = false } = submission;

    // update the messages
    if (isRegenerate) {
      setMindMapMessages([...messages, responseMessage]);
    } else {
      setMindMapMessages([...messages, requestMessage, responseMessage]);
    }
    setIsSubmitting(false);

    // refresh title
    if (requestMessage.parentMessageId == store.initNodeId) {
      setTimeout(() => {
        refreshMindMapConversations();
      }, 2000);

      // in case it takes too long.
      setTimeout(() => {
        refreshMindMapConversations();
      }, 5000);
    }

    setMindMapConversation((prevState) => ({
      ...prevState,
      ...conversation,
    }));
  };

  const errorHandler = (data: TResData, submission: TSubmission) => {
    const { messages, message } = submission;

    console.log('Error:', data);
    const errorResponse = tMessageSchema.parse({
      ...data,
      error: true,
      parentMessageId: message?.messageId,
    });
    setIsSubmitting(false);
    setMindMapMessages([...messages, message, errorResponse]);
    return;
  };

  const abortConversation = (conversationId = '', submission: TSubmission) => {
    console.log(submission);
    const { endpoint } = submission?.conversation || {};

    fetch(`/api/ask/${endpoint}/abort`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        abortKey: conversationId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('aborted', data);
        cancelHandler(data, submission);
      })
      .catch((error) => {
        console.error('Error aborting request');
        console.error(error);
        // errorHandler({ text: 'Error aborting request' }, { ...submission, message });
      });
    return;
  };

  useEffect(() => {
    console.log('submission', submission);
    if (submission === null) {
      return;
    }
    if (Object.keys(submission).length === 0) {
      return;
    }

    let { message } = submission;

    const { server, payload } = createPayload(submission);

    const events = new SSE(server, {
      payload: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    events.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (data.final) {
        const { plugins } = data;
        finalHandler(data, { ...submission, plugins, message });
        startupConfig?.checkBalance && balanceQuery.refetch();
        console.log('final', data);
      }
      if (data.created) {
        message = {
          ...data.message,
          overrideParentMessageId: message?.overrideParentMessageId,
        };
        createdHandler(data, { ...submission, message });
      } else {
        const text = data.text || data.response;
        const { plugin, plugins } = data;

        if (data.message) {
          messageHandler(text, { ...submission, plugin, plugins, message });
        }
      }
    };

    events.onopen = () => console.log('connection is opened');

    events.oncancel = () =>
      abortConversation(message?.conversationId ?? submission?.conversationId, submission);

    events.onerror = function (e: MessageEvent) {
      console.log('error in opening conn.');
      startupConfig?.checkBalance && balanceQuery.refetch();
      events.close();

      const data = JSON.parse(e.data);

      errorHandler(data, { ...submission, message });
    };

    setIsSubmitting(true);
    events.stream();

    return () => {
      const isCancelled = events.readyState <= 1;
      events.close();
      // setSource(null);
      if (isCancelled) {
        const e = new Event('cancel');
        events.dispatchEvent(e);
      }
      setIsSubmitting(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);
}
