import { useCallback } from 'react';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import {
  useSetRecoilState,
  useResetRecoilState,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from 'recoil';
import type {
  TConversation,
  TSubmission,
  TPreset,
  TModelsConfig,
  TEndpointsConfig,
} from 'librechat-data-provider';
import { buildDefaultConvo, getDefaultEndpoint, getEndpointField } from '~/utils';
import { useDeleteFilesMutation } from '~/data-provider';
import useMindMapOriginNavigate from './useMindMapOriginNavigate';
import useSetStorage from './useSetStorage';
import store from '~/store';

const useNewMindMapConvo = (index = 0) => {
  const setStorage = useSetStorage();
  const navigate = useMindMapOriginNavigate();
  const defaultPreset = useRecoilValue(store.defaultPreset);
  const { setMindMapConversation } = store.useCreateMindMapConversationAtom(index);
  const [files, setFiles] = useRecoilState(store.filesByIndex(index));
  const setSubmission = useSetRecoilState<TSubmission | null>(
    store.submissionByNodeId(store.initNodeId),
  );
  const resetLatestMindMapMessage = useResetRecoilState(
    store.latestMindMapMessageFamily(store.initNodeId),
  );
  const { data: endpointsConfig = {} as TEndpointsConfig } = useGetEndpointsQuery();

  const { mutateAsync } = useDeleteFilesMutation({
    onSuccess: () => {
      console.log('Files deleted');
    },
    onError: (error) => {
      console.log('Error deleting files:', error);
    },
  });

  const switchToMindMapConversation = useRecoilCallback(
    ({ snapshot }) =>
      async (
        conversation: TConversation,
        preset: TPreset | null = null,
        modelsData?: TModelsConfig,
        buildDefault?: boolean,
        keepLatestMessage?: boolean,
      ) => {
        const modelsConfig = modelsData ?? snapshot.getLoadable(store.modelsConfig).contents;
        const { endpoint = null } = conversation;
        const buildDefaultConversation = endpoint === null || buildDefault;
        const activePreset =
          // use default preset only when it's defined,
          // preset is not provided,
          // endpoint matches or is null (to allow endpoint change),
          // and buildDefaultConversation is true
          defaultPreset &&
          !preset &&
          (defaultPreset.endpoint === endpoint || !endpoint) &&
          buildDefaultConversation
            ? defaultPreset
            : preset;

        if (buildDefaultConversation) {
          const defaultEndpoint = getDefaultEndpoint({
            convoSetup: activePreset ?? conversation,
            endpointsConfig,
          });

          const endpointType = getEndpointField(endpointsConfig, defaultEndpoint, 'type');
          if (!conversation.endpointType && endpointType) {
            conversation.endpointType = endpointType;
          }

          const models = modelsConfig?.[defaultEndpoint] ?? [];
          conversation = buildDefaultConvo({
            conversation,
            lastConversationSetup: activePreset as TConversation,
            endpoint: defaultEndpoint,
            models,
          });
        }

        setStorage(conversation);
        setMindMapConversation(conversation);
        setSubmission({} as TSubmission);
        if (!keepLatestMessage) {
          resetLatestMindMapMessage();
        }

        if (conversation.conversationId === 'new' && !modelsData) {
          navigate('/m/c/new');
        }
      },
    [endpointsConfig, defaultPreset],
  );

  const newMindMapConversation = useCallback(
    ({
      template = {},
      preset,
      modelsData,
      buildDefault = true,
      keepLatestMessage = false,
    }: {
      template?: Partial<TConversation>;
      preset?: TPreset;
      modelsData?: TModelsConfig;
      buildDefault?: boolean;
      keepLatestMessage?: boolean;
    } = {}) => {
      const conversation = {
        conversationId: 'new',
        title: 'New Chat',
        endpoint: null,
        ...template,
        createdAt: '',
        updatedAt: '',
      };

      if (conversation.conversationId === 'new' && !modelsData) {
        const filesToDelete = Array.from(files.values())
          .filter((file) => file.filepath)
          .map((file) => ({
            file_id: file.file_id,
            filepath: file.filepath as string,
          }));

        setFiles(new Map());
        localStorage.setItem('filesToDelete', JSON.stringify({}));

        if (filesToDelete.length > 0) {
          mutateAsync({ files: filesToDelete });
        }
      }

      switchToMindMapConversation(
        conversation,
        preset,
        modelsData,
        buildDefault,
        keepLatestMessage,
      );
    },
    [switchToMindMapConversation, files, mutateAsync, setFiles],
  );

  return {
    switchToMindMapConversation,
    newMindMapConversation,
  };
};

export default useNewMindMapConvo;
