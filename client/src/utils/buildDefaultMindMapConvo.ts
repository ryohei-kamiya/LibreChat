import { parseConvo } from 'librechat-data-provider';
import getLocalStorageItems from './getLocalStorageItems';
import type { TConversation, EModelEndpoint } from 'librechat-data-provider';

const buildDefaultMindMapConvo = ({
  conversation,
  endpoint,
  models,
  lastConversationSetup,
}: {
  conversation: TConversation;
  endpoint: EModelEndpoint;
  models: string[];
  // TODO: fix this type as we should allow undefined
  lastConversationSetup: TConversation;
}) => {
  const { lastSelectedModel, lastSelectedTools, lastBingSettings } = getLocalStorageItems();
  const { jailbreak, toneStyle } = lastBingSettings;
  const endpointType = lastConversationSetup?.endpointType ?? conversation?.endpointType;

  if (!endpoint) {
    return {
      ...conversation,
      endpointType,
      endpoint,
    };
  }

  const availableModels = models;
  const model = lastConversationSetup?.model ?? lastSelectedModel?.[endpoint];
  const secondaryModel =
    endpoint === 'gptPlugins'
      ? lastConversationSetup?.agentOptions?.model ?? lastSelectedModel?.secondaryModel
      : null;

  let possibleModels: string[], secondaryModels: string[];

  if (availableModels.includes(model)) {
    possibleModels = [model, ...availableModels];
  } else {
    possibleModels = [...availableModels];
  }

  if (secondaryModel && availableModels.includes(secondaryModel)) {
    secondaryModels = [secondaryModel, ...availableModels];
  } else {
    secondaryModels = [...availableModels];
  }

  const convo = parseConvo({
    endpoint,
    endpointType,
    conversation: lastConversationSetup,
    possibleValues: {
      models: possibleModels,
      secondaryModels,
    },
  });

  const defaultMindMapConvo = {
    ...conversation,
    ...convo,
    endpointType,
    endpoint,
  };

  defaultMindMapConvo.tools = lastSelectedTools ?? defaultMindMapConvo.tools;
  defaultMindMapConvo.jailbreak = jailbreak ?? defaultMindMapConvo.jailbreak;
  defaultMindMapConvo.toneStyle = toneStyle ?? defaultMindMapConvo.toneStyle;

  return defaultMindMapConvo;
};

export default buildDefaultMindMapConvo;
