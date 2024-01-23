import { useRecoilValue, useSetRecoilState } from 'recoil';
import { TPreset, TPlugin, tConversationSchema, EModelEndpoint } from 'librechat-data-provider';
import type { TSetExample, TSetOption, TSetOptionsPayload } from '~/common';
import usePresetIndexOptions from './usePresetIndexOptions';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
import useLocalStorage from './useLocalStorage';
import store from '~/store';

type TUseSetOptions = (
  id: number,
  paramId: string | undefined,
  nodeId: string | undefined,
  preset?: TPreset | boolean | null,
) => TSetOptionsPayload;

const useMindMapSetOptions: TUseSetOptions = (
  id = 0,
  paramId: string | undefined = undefined,
  nodeId: string | undefined = undefined,
  preset = false,
) => {
  const setShowPluginStoreDialog = useSetRecoilState(store.showPluginStoreDialog);
  const availableTools = useRecoilValue(store.availableTools);
  const { mindMapConversation, setMindMapConversation } = useMindMapHelpers(id, paramId, nodeId);
  const [lastBingSettings, setLastBingSettings] = useLocalStorage('lastBingSettings', {});
  const [lastModel, setLastModel] = useLocalStorage('lastSelectedModel', {
    primaryModel: '',
    secondaryModel: '',
  });

  const result = usePresetIndexOptions(preset);

  if (result && typeof result !== 'boolean') {
    return result;
  }

  const setOption: TSetOption = (param) => (newValue) => {
    const { endpoint } = mindMapConversation ?? {};
    const update = {};
    update[param] = newValue;

    if (param === 'model' && endpoint) {
      const lastModelUpdate = { ...lastModel, [endpoint]: newValue };
      setLastModel(lastModelUpdate);
    } else if (param === 'jailbreak' && endpoint) {
      setLastBingSettings({ ...lastBingSettings, jailbreak: newValue });
    }

    setMindMapConversation((prevState) =>
      tConversationSchema.parse({
        ...prevState,
        ...update,
      }),
    );
  };

  const setExample: TSetExample = (i, type, newValue = null) => {
    const update = {};
    const current = mindMapConversation?.examples?.slice() || [];
    const currentExample = { ...current[i] } || {};
    currentExample[type] = { content: newValue };
    current[i] = currentExample;
    update['examples'] = current;
    setMindMapConversation((prevState) =>
      tConversationSchema.parse({
        ...prevState,
        ...update,
      }),
    );
  };

  const addExample: () => void = () => {
    const update = {};
    const current = mindMapConversation?.examples?.slice() || [];
    current.push({ input: { content: '' }, output: { content: '' } });
    update['examples'] = current;
    setMindMapConversation((prevState) =>
      tConversationSchema.parse({
        ...prevState,
        ...update,
      }),
    );
  };

  const removeExample: () => void = () => {
    const update = {};
    const current = mindMapConversation?.examples?.slice() || [];
    if (current.length <= 1) {
      update['examples'] = [{ input: { content: '' }, output: { content: '' } }];
      setMindMapConversation((prevState) =>
        tConversationSchema.parse({
          ...prevState,
          ...update,
        }),
      );
      return;
    }
    current.pop();
    update['examples'] = current;
    setMindMapConversation((prevState) =>
      tConversationSchema.parse({
        ...prevState,
        ...update,
      }),
    );
  };

  function checkPluginSelection(value: string) {
    if (!mindMapConversation?.tools) {
      return false;
    }
    return mindMapConversation.tools.find((el) => el.pluginKey === value) ? true : false;
  }

  const setAgentOption: TSetOption = (param) => (newValue) => {
    const editableConvo = JSON.stringify(mindMapConversation);
    const convo = JSON.parse(editableConvo);
    const { agentOptions } = convo;
    agentOptions[param] = newValue;
    console.log('agentOptions', agentOptions, param, newValue);
    if (param === 'model' && typeof newValue === 'string') {
      const lastModelUpdate = { ...lastModel, [EModelEndpoint.gptPlugins]: newValue };
      lastModelUpdate.secondaryModel = newValue;
      setLastModel(lastModelUpdate);
    }
    setMindMapConversation((prevState) =>
      tConversationSchema.parse({
        ...prevState,
        agentOptions,
      }),
    );
  };

  const setTools: (newValue: string) => void = (newValue) => {
    if (newValue === 'pluginStore') {
      setShowPluginStoreDialog(true);
      return;
    }

    const update = {};
    const current = mindMapConversation?.tools || [];
    const isSelected = checkPluginSelection(newValue);
    const tool =
      availableTools[availableTools.findIndex((el: TPlugin) => el.pluginKey === newValue)];
    if (isSelected) {
      update['tools'] = current.filter((el) => el.pluginKey !== newValue);
    } else {
      update['tools'] = [...current, tool];
    }

    localStorage.setItem('lastSelectedTools', JSON.stringify(update['tools']));
    setMindMapConversation((prevState) =>
      tConversationSchema.parse({
        ...prevState,
        ...update,
      }),
    );
  };

  return {
    setOption,
    setExample,
    addExample,
    removeExample,
    setAgentOption,
    checkPluginSelection,
    setTools,
  };
};

export default useMindMapSetOptions;
