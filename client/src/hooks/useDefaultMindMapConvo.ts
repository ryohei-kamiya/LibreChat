import { useRecoilValue } from 'recoil';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import type { TConversation, TPreset } from 'librechat-data-provider';
import { getDefaultEndpoint, buildDefaultMindMapConvo } from '~/utils';
import store from '~/store';

type TDefaultConvo = { conversation: Partial<TConversation>; preset?: Partial<TPreset> | null };

const useDefaultMindMapConvo = () => {
  const { data: endpointsConfig = {} } = useGetEndpointsQuery();
  const modelsConfig = useRecoilValue(store.modelsConfig);

  const getDefaultMindMapConversation = ({ conversation, preset }: TDefaultConvo) => {
    const endpoint = getDefaultEndpoint({
      convoSetup: preset as TPreset,
      endpointsConfig,
    });
    const models = modelsConfig?.[endpoint] || [];

    return buildDefaultMindMapConvo({
      conversation: conversation as TConversation,
      endpoint,
      lastConversationSetup: preset as TConversation,
      models,
    });
  };

  return getDefaultMindMapConversation;
};

export default useDefaultMindMapConvo;
