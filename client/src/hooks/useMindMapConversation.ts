import { useCallback } from 'react';
import { useSetRecoilState, useResetRecoilState, useRecoilCallback } from 'recoil';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import type {
  TConversation,
  TMessagesAtom,
  TSubmission,
  TPreset,
  TModelsConfig,
  TEndpointsConfig,
} from 'librechat-data-provider';
import { buildDefaultMindMapConvo, getDefaultEndpoint, getEndpointField } from '~/utils';
import useMindMapOriginNavigate from './useMindMapOriginNavigate';
import store from '~/store';

const useMindMapConversation = () => {
  const navigate = useMindMapOriginNavigate();
  const setMindMapConversation = useSetRecoilState(store.mindMapConversation);
  const setMindMapMessages = useSetRecoilState<TMessagesAtom>(store.mindMapMessages);
  const setSubmission = useSetRecoilState<TSubmission | null>(
    store.submissionByNodeId(store.initNodeId),
  );
  const resetLatestMindMapMessage = useResetRecoilState(
    store.latestMindMapMessageFamily(store.initNodeId),
  );
  const { data: endpointsConfig = {} as TEndpointsConfig } = useGetEndpointsQuery();

  const switchToMindMapConversation = useRecoilCallback(
    ({ snapshot }) =>
      async (
        conversation: TConversation,
        messages: TMessagesAtom = null,
        preset: TPreset | null = null,
        modelsData?: TModelsConfig,
      ) => {
        const modelsConfig = modelsData ?? snapshot.getLoadable(store.modelsConfig).contents;
        const { endpoint = null } = conversation;

        if (endpoint === null) {
          const defaultEndpoint = getDefaultEndpoint({
            convoSetup: preset ?? conversation,
            endpointsConfig,
          });

          const endpointType = getEndpointField(endpointsConfig, defaultEndpoint, 'type');
          if (!conversation.endpointType && endpointType) {
            conversation.endpointType = endpointType;
          }

          const models = modelsConfig?.[defaultEndpoint] ?? [];
          conversation = buildDefaultMindMapConvo({
            conversation,
            lastConversationSetup: preset as TConversation,
            endpoint: defaultEndpoint,
            models,
          });
        }

        setMindMapConversation(conversation);
        setMindMapMessages(messages);
        setSubmission({} as TSubmission);
        resetLatestMindMapMessage();

        if (conversation.conversationId === 'new' && !modelsData) {
          navigate('/m/c/new');
        }
      },
    [endpointsConfig],
  );

  const newMindMapConversation = useCallback(
    (template = {}, preset?: TPreset, modelsData?: TModelsConfig) => {
      switchToMindMapConversation(
        {
          conversationId: 'new',
          title: 'New Chat',
          ...template,
          endpoint: null,
          createdAt: '',
          updatedAt: '',
        },
        [],
        preset,
        modelsData,
      );
    },
    [switchToMindMapConversation],
  );

  const searchPlaceholderMindMapConversation = useCallback(() => {
    switchToMindMapConversation(
      {
        conversationId: 'search',
        title: 'Search',
        endpoint: null,
        createdAt: '',
        updatedAt: '',
      },
      [],
    );
  }, [switchToMindMapConversation]);

  return {
    switchToMindMapConversation,
    newMindMapConversation,
    searchPlaceholderMindMapConversation,
  };
};

export default useMindMapConversation;
