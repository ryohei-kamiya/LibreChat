import copy from 'copy-to-clipboard';
import { useEffect, useRef } from 'react';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import type { TMessage } from 'librechat-data-provider';
import type { TMessageProps } from '~/common';
import Icon from '~/components/MindMapEndpoints/Icon';
import { getEndpointField } from '~/utils';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
import useMindMapNodeHandler from '~/hooks/useMindMapNodeHandler';

export default function useMindMapMessageHelpers(props: TMessageProps) {
  const latestText = useRef('');
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { id, paramId, nodeId, message, currentEditId, setCurrentEditId } = props;

  const { isSubmitting, setAbortScroll } = useMindMapNodeHandler(nodeId);
  const {
    ask,
    regenerate,
    mindMapConversation,
    latestMindMapMessage,
    handleContinue,
    setLatestMindMapMessage,
  } = useMindMapHelpers(id, paramId, nodeId);

  const { text, children, messageId = null, isCreatedByUser } = message ?? {};
  const edit = messageId === currentEditId;
  const isLast = !children?.length;

  useEffect(() => {
    if (!message) {
      return;
    } else if (
      isLast &&
      mindMapConversation?.conversationId !== 'new' &&
      latestText.current !== message.text
    ) {
      setLatestMindMapMessage({ ...message });
      latestText.current = message.text;
    }
  }, [isLast, message, setLatestMindMapMessage, mindMapConversation?.conversationId]);

  const enterEdit = (cancel?: boolean) =>
    setCurrentEditId && setCurrentEditId(cancel ? -1 : messageId);

  const handleScroll = () => {
    if (isSubmitting) {
      setAbortScroll(true);
    } else {
      setAbortScroll(false);
    }
  };

  const icon = Icon({
    ...mindMapConversation,
    ...(message as TMessage),
    iconURL: getEndpointField(endpointsConfig, mindMapConversation?.endpoint, 'iconURL'),
    model: message?.model ?? mindMapConversation?.model,
    size: 28.8,
  });

  const regenerateMessage = () => {
    if ((isSubmitting && isCreatedByUser) || !message) {
      return;
    }

    regenerate(message);
  };

  const copyToClipboard = (setIsCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsCopied(true);
    copy(text ?? '');

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return {
    ask,
    icon,
    edit,
    isLast,
    enterEdit,
    mindMapConversation,
    isSubmitting,
    handleScroll,
    latestMindMapMessage,
    handleContinue,
    copyToClipboard,
    regenerateMessage,
  };
}
