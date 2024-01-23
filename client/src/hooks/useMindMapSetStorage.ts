import type { TConversation } from 'librechat-data-provider';
import useLocalStorage from './useLocalStorage';

const useMindMapSetStorage = () => {
  const [lastBingSettings, setLastBingSettings] = useLocalStorage('lastBingSettings', {});
  const setLastMindMapConvo = useLocalStorage('lastMindMapConversationSetup', {})[1];
  const [lastModel, setLastModel] = useLocalStorage('lastSelectedModel', {
    primaryModel: '',
    secondaryModel: '',
  });

  const setStorage = (conversation: TConversation) => {
    const { endpoint } = conversation;
    if (endpoint && endpoint !== 'bingAI') {
      const lastModelUpdate = { ...lastModel, [endpoint]: conversation?.model };
      if (endpoint === 'gptPlugins') {
        lastModelUpdate.secondaryModel = conversation?.agentOptions?.model ?? '';
      }
      setLastModel(lastModelUpdate);
    } else if (endpoint === 'bingAI') {
      const { jailbreak, toneStyle } = conversation;
      setLastBingSettings({ ...lastBingSettings, jailbreak, toneStyle });
    }

    setLastMindMapConvo(conversation);
  };

  return setStorage;
};

export default useMindMapSetStorage;
