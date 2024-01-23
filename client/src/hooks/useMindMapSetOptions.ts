import { TConversation, TPreset, TPlugin, tConversationSchema } from 'librechat-data-provider';
import type { TSetExample, TSetOption, TSetOptionsPayload } from '~/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import useMindMapPresetOptions from './useMindMapPresetOptions';
import store from '~/store';

type TUseSetOptions = (preset?: TPreset | boolean | null) => TSetOptionsPayload;

const useMindMapSetOptions: TUseSetOptions = (preset = false) => {
  const setShowPluginStoreDialog = useSetRecoilState(store.showPluginStoreDialog);
  const [mindMapConversation, setMindMapConversation] = useRecoilState(store.mindMapConversation);
  const availableTools = useRecoilValue(store.availableTools);

  const result = useMindMapPresetOptions(preset);

  if (result && typeof result !== 'boolean') {
    return result;
  }

  const setOption: TSetOption = (param) => (newValue) => {
    const update = {};
    update[param] = newValue;
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

  const getConversation: () => TConversation | null = () => mindMapConversation;

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
    getConversation,
    checkPluginSelection,
    setTools,
  };
};

export default useMindMapSetOptions;
