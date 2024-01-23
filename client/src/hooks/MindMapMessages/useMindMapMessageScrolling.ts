import { useRecoilValue } from 'recoil';
import { useLayoutEffect, useState, useRef, useCallback, useEffect } from 'react';
import type { TMessage } from 'librechat-data-provider';
import useScrollToRef from '../useScrollToRef';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
import useMindMapNodeHandler from '~/hooks/useMindMapNodeHandler';
import store from '~/store';

export default function useMindMapMessageScrolling(
  id = 0,
  paramId: string | undefined = undefined,
  nodeId: string | undefined = undefined,
  messagesTree?: TMessage[] | null,
) {
  const autoScroll = useRecoilValue(store.autoScroll);

  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { setAbortScroll, isSubmitting, abortScroll } = useMindMapNodeHandler(nodeId);
  const { mindMapConversation } = useMindMapHelpers(id, paramId, nodeId);
  const { conversationId } = mindMapConversation ?? {};

  const checkIfAtBottom = useCallback(() => {
    if (!scrollableRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollableRef.current;
    const diff = Math.abs(scrollHeight - scrollTop);
    const percent = Math.abs(clientHeight - diff) / clientHeight;
    const hasScrollbar = scrollHeight > clientHeight && percent >= 0.15;
    setShowScrollButton(hasScrollbar);
  }, [scrollableRef]);

  useLayoutEffect(() => {
    const scrollableElement = scrollableRef.current;
    if (!scrollableElement) {
      return;
    }
    const timeoutId = setTimeout(checkIfAtBottom, 650);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [checkIfAtBottom]);

  const debouncedHandleScroll = useCallback(() => {
    clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(checkIfAtBottom, 100);
  }, [checkIfAtBottom]);

  const scrollCallback = () => setShowScrollButton(false);

  const { scrollToRef: scrollToBottom, handleSmoothToRef } = useScrollToRef({
    targetRef: messagesEndRef,
    callback: scrollCallback,
    smoothCallback: () => {
      scrollCallback();
      setAbortScroll(false);
    },
  });

  useEffect(() => {
    if (!messagesTree) {
      return;
    }

    if (isSubmitting && scrollToBottom && !abortScroll) {
      scrollToBottom();
    }
  }, [isSubmitting, messagesTree, scrollToBottom, abortScroll]);

  useEffect(() => {
    if (scrollToBottom && autoScroll && conversationId !== 'new') {
      scrollToBottom();
    }
  }, [autoScroll, conversationId, scrollToBottom]);

  return {
    mindMapConversation,
    scrollableRef,
    messagesEndRef,
    scrollToBottom,
    showScrollButton,
    handleSmoothToRef,
    debouncedHandleScroll,
  };
}
