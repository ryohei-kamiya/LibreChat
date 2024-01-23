import { v4 } from 'uuid';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import {
  /* @ts-ignore */
  SSE,
  EndpointURLs,
  createPayload,
  tMessageSchema,
  tConvoUpdateSchema,
  EModelEndpoint,
  removeNullishValues,
} from 'librechat-data-provider';
import { useGetUserBalance, useGetStartupConfig } from 'librechat-data-provider/react-query';
import type { TResPlugin, TMessage, TConversation, TSubmission } from 'librechat-data-provider';
import { useAuthContext } from './AuthContext';
import useMindMapHelpers from './useMindMapHelpers';
import useMindMapNodeHandler from './useMindMapNodeHandler';
import useSetStorage from './useSetStorage';
import store from '../store';

type TResData = {
  plugin?: TResPlugin;
  final?: boolean;
  initial?: boolean;
  requestMessage: TMessage;
  responseMessage: TMessage | TMessage[];
  conversation: TConversation;
  conversationId?: string;
};

export default function useMindMapSSE(
  submission: TSubmission | null,
  index = 0,
  nodeId: string | undefined = undefined,
) {
  const setStorage = useSetStorage();
  const { conversationId: paramId } = useParams();
  const { token, isAuthenticated } = useAuthContext();
  const { setIsSubmitting } = useMindMapNodeHandler(nodeId);
  const {
    addConvo,
    getMessages,
    setMessages,
    setMindMapConversation,
    resetLatestMindMapMessage,
    invalidateConvos,
    newMindMapConversation,
  } = useMindMapHelpers(index, paramId, nodeId);

  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.checkBalance,
  });

  const navigate = useNavigate();

  const messageHandler = (data: string, submission: TSubmission) => {
    const {
      messages,
      message,
      plugin,
      plugins,
      initialResponse,
      isRegenerate = false,
    } = submission;
    console.log(message);

    if (isRegenerate) {
      setMessages([
        ...messages,
        {
          ...initialResponse,
          text: data,
          parentMessageId: message?.overrideParentMessageId ?? null,
          messageId: message?.overrideParentMessageId + '_',
          plugin: plugin ?? null,
          plugins: plugins ?? [],
          // unfinished: true
        },
      ]);
    } else {
      setMessages([
        ...messages,
        message,
        {
          ...initialResponse,
          text: data,
          parentMessageId: message?.messageId,
          messageId: message?.messageId + '_',
          plugin: plugin ?? null,
          plugins: plugins ?? [],
          // unfinished: true
        },
      ]);
    }
  };

  const cancelHandler = (data: TResData, submission: TSubmission) => {
    const { requestMessage, responseMessage, conversation } = data;
    const { messages, isRegenerate = false } = submission;

    const convoUpdate = conversation ?? submission.conversation;

    // update the messages
    if (isRegenerate) {
      const messagesUpdate = [
        ...messages,
        ...(Array.isArray(responseMessage) ? responseMessage : [responseMessage]),
      ].filter((msg) => msg);
      setMessages(messagesUpdate);
    } else {
      const messagesUpdate = [
        ...messages,
        requestMessage,
        ...(Array.isArray(responseMessage) ? responseMessage : [responseMessage]),
      ].filter((msg) => msg);
      setMessages(messagesUpdate);
    }

    // refresh title
    if (requestMessage?.parentMessageId == store.initNodeId) {
      setTimeout(() => {
        invalidateConvos();
      }, 2000);

      // in case it takes too long.
      setTimeout(() => {
        invalidateConvos();
      }, 5000);
    }

    setMindMapConversation((prevState) => {
      const update = {
        ...prevState,
        ...convoUpdate,
      };

      setStorage(update);
      return update;
    });

    setIsSubmitting(false);
  };

  const createdHandler = (data: TResData, submission: TSubmission) => {
    const { messages, message, initialResponse, isRegenerate = false } = submission;
    console.log(message);

    if (isRegenerate) {
      setMessages([
        ...messages,
        {
          ...initialResponse,
          parentMessageId: message?.overrideParentMessageId ?? null,
          messageId: message?.overrideParentMessageId + '_',
        },
      ]);
    } else {
      setMessages([
        ...messages,
        message,
        {
          ...initialResponse,
          parentMessageId: message?.messageId,
          messageId: message?.messageId + '_',
        },
      ]);
    }

    const { conversationId } = message;

    let update = {} as TConversation;
    setMindMapConversation((prevState) => {
      update = tConvoUpdateSchema.parse({
        ...prevState,
        conversationId,
      }) as TConversation;

      setStorage(update);
      return update;
    });
    if (message.parentMessageId == store.initNodeId) {
      addConvo(update);
    }
    resetLatestMindMapMessage();
  };

  const finalHandler = (data: TResData, submission: TSubmission) => {
    const { requestMessage, responseMessage, conversation } = data;
    const { conversation: submissionConvo, isRegenerate = false } = submission;
    const messages = getMessages() ?? submission.messages;

    // update the messages
    if (isRegenerate) {
      setMessages([
        ...messages,
        ...(Array.isArray(responseMessage) ? responseMessage : [responseMessage]),
      ]);
    } else {
      setMessages([
        ...messages,
        requestMessage,
        ...(Array.isArray(responseMessage) ? responseMessage : [responseMessage]),
      ]);
    }

    // refresh title
    if (requestMessage.parentMessageId == store.initNodeId) {
      setTimeout(() => {
        invalidateConvos();
      }, 1500);

      // in case it takes too long.
      setTimeout(() => {
        invalidateConvos();
      }, 5000);
    }

    setMindMapConversation((prevState) => {
      const update = {
        ...prevState,
        ...conversation,
      };

      // Revert to previous model if the model was auto-switched by backend due to message attachments
      if (conversation.model?.includes('vision') && !submissionConvo.model?.includes('vision')) {
        update.model = submissionConvo?.model;
      }

      setStorage(update);
      return update;
    });

    setIsSubmitting(false);

    if (paramId === 'new') {
      navigate(`/m/c/${conversation.conversationId}`);
    }
  };

  const errorHandler = ({ data, submission }: { data?: TResData; submission: TSubmission }) => {
    const { messages, message, initialResponse } = submission;

    const conversationId = message?.conversationId ?? submission?.conversationId;
    const parseErrorResponse = (data: TResData | Partial<TMessage>) => {
      const metadata = data['responseMessage'] ?? data;
      const errorMessage = {
        ...initialResponse,
        ...metadata,
        error: true,
        parentMessageId: message?.messageId,
      };

      if (!errorMessage.messageId) {
        errorMessage.messageId = v4();
      }

      return tMessageSchema.parse(errorMessage);
    };

    if (!data) {
      const convoId = conversationId ?? v4();
      const errorResponse = parseErrorResponse({
        text: 'Error connecting to server',
        ...submission,
        conversationId: convoId,
      });
      setMessages([...messages, message, errorResponse]);
      newMindMapConversation({ template: { conversationId: convoId } });
      setIsSubmitting(false);
      return;
    }

    if (!conversationId && !data.conversationId) {
      const convoId = v4();
      const errorResponse = parseErrorResponse(data);
      setMessages([...messages, message, errorResponse]);
      newMindMapConversation({ template: { conversationId: convoId } });
      setIsSubmitting(false);
      return;
    }

    console.log('Error:', data);
    const errorResponse = tMessageSchema.parse({
      ...data,
      error: true,
      parentMessageId: message?.messageId,
    });

    setMessages([...messages, message, errorResponse]);
    if (data.conversationId && paramId === 'new') {
      newMindMapConversation({ template: { conversationId: data.conversationId } });
    }

    setIsSubmitting(false);
    return;
  };

  const abortConversation = (conversationId = '', submission: TSubmission) => {
    const { endpoint: _endpoint, endpointType } = submission?.conversation || {};
    const endpoint = endpointType ?? _endpoint;
    let res: Response;

    fetch(`${EndpointURLs[endpoint ?? '']}/abort`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        abortKey: conversationId,
      }),
    })
      .then((response) => {
        res = response;
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else if (response.status === 204) {
          const responseMessage = {
            ...submission.initialResponse,
            text: submission.initialResponse.text.replace(
              '<span className="result-streaming">█</span>',
              '',
            ),
          };

          return {
            requestMessage: submission.message,
            responseMessage: responseMessage,
            conversation: submission.conversation,
          };
        } else {
          throw new Error(
            'Unexpected response from server; Status: ' + res.status + ' ' + res.statusText,
          );
        }
      })
      .then((data) => {
        console.log('aborted', data);
        if (res.status === 404) {
          return setIsSubmitting(false);
        }
        cancelHandler(data, submission);
      })
      .catch((error) => {
        console.error('Error aborting request');
        console.error(error);
        const convoId = conversationId ?? v4();

        const text =
          submission.initialResponse?.text?.length > 45 ? submission.initialResponse?.text : '';

        const errorMessage = {
          ...submission,
          ...submission.initialResponse,
          text: text ?? error.message ?? 'Error cancelling request',
          unfinished: !!text.length,
          error: true,
        };

        const errorResponse = tMessageSchema.parse(errorMessage);
        setMessages([...submission.messages, submission.message, errorResponse]);
        newMindMapConversation({ template: { conversationId: convoId } });
        setIsSubmitting(false);
      });
    return;
  };

  useEffect(() => {
    if (submission === null) {
      return;
    }
    if (Object.keys(submission).length === 0) {
      return;
    }

    let { message } = submission;

    const payloadData = createPayload(submission);
    let { payload } = payloadData;
    if (payload.endpoint === EModelEndpoint.assistant) {
      payload = removeNullishValues(payload);
    }

    const events = new SSE(payloadData.server, {
      payload: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    console.log(nodeId, payload, submission);

    events.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);

      if (data.final) {
        console.log('data.final');
        const { plugins } = data;
        finalHandler(data, { ...submission, plugins, message });
        startupConfig?.checkBalance && balanceQuery.refetch();
        events.close();
      }
      if (data.created) {
        console.log('data.created');
        message = {
          ...message,
          ...data.message,
          overrideParentMessageId: message?.overrideParentMessageId,
        };
        createdHandler(data, { ...submission, message });
      } else {
        console.log('data else');
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
      console.log('error in server stream.');
      startupConfig?.checkBalance && balanceQuery.refetch();
      events.close();

      let data: TResData | undefined = undefined;
      try {
        data = JSON.parse(e.data) as TResData;
      } catch (error) {
        console.error(error);
        console.log(e);
      }

      errorHandler({ data, submission: { ...submission, message } });
      events.oncancel();
    };

    setIsSubmitting(true);
    events.stream();
    console.log(submission);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);
}
