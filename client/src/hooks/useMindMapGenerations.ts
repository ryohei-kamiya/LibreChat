import type { TMessage } from 'librechat-data-provider';
import { EModelEndpoint } from 'librechat-data-provider';
import { useRecoilValue } from 'recoil';
import store from '~/store';

type TUseGenerations = {
  endpoint?: string;
  message: TMessage;
  isSubmitting: boolean;
  isEditing?: boolean;
  latestMindMapMessage?: TMessage | null;
};

export default function useMindMapGenerations({
  endpoint,
  message,
  isSubmitting,
  isEditing = false,
  latestMindMapMessage: _latestMindMapMessage,
}: TUseGenerations) {
  const latestMindMapMessage = useRecoilValue(store.latestMindMapMessage) ?? _latestMindMapMessage;

  const { error, messageId, searchResult, finish_reason, isCreatedByUser } = message ?? {};
  const isEditableEndpoint = !![
    EModelEndpoint.openAI,
    EModelEndpoint.google,
    EModelEndpoint.assistant,
    EModelEndpoint.anthropic,
    EModelEndpoint.gptPlugins,
    EModelEndpoint.azureOpenAI,
  ].find((e) => e === endpoint);

  const continueSupported =
    latestMindMapMessage?.messageId === messageId &&
    finish_reason &&
    finish_reason !== 'stop' &&
    !isEditing &&
    !searchResult &&
    isEditableEndpoint;

  const branchingSupported =
    // 5/21/23: Bing is allowing editing and Message regenerating
    !![
      EModelEndpoint.azureOpenAI,
      EModelEndpoint.openAI,
      EModelEndpoint.chatGPTBrowser,
      EModelEndpoint.google,
      EModelEndpoint.bingAI,
      EModelEndpoint.gptPlugins,
      EModelEndpoint.anthropic,
    ].find((e) => e === endpoint);

  const regenerateEnabled =
    !isCreatedByUser && !searchResult && !isEditing && !isSubmitting && branchingSupported;

  const hideEditButton =
    isSubmitting ||
    error ||
    searchResult ||
    !branchingSupported ||
    (!isEditableEndpoint && !isCreatedByUser);

  return {
    continueSupported,
    regenerateEnabled,
    hideEditButton,
  };
}
