import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import type { ReactNode } from 'react';
import type { TMessage } from 'librechat-data-provider';
import ScrollToBottom from '~/components/MindMapMessages/ScrollToBottom';
import { useScreenshot, useMindMapMessageScrolling } from '~/hooks';
import { CSSTransition } from 'react-transition-group';
import MultiMessage from './MultiMessage';
import { NodeData } from '~/store/mindMapNode';
import store from '~/store';

export default function MessagesView({
  nodeId,
  data,
  Header,
}: {
  nodeId: string;
  data: NodeData;
  messagesTree?: TMessage[] | null;
  Header?: ReactNode;
}) {
  const { messagesTree: _messagesTree, conversationId, nodeIndex } = data;
  const { screenshotTargetRef } = useScreenshot();
  const [currentEditId, setCurrentEditId] = useState<number | string | null>(-1);

  const {
    scrollableRef,
    messagesEndRef,
    showScrollButton,
    handleSmoothToRef,
    debouncedHandleScroll,
  } = useMindMapMessageScrolling(0, conversationId, nodeId, _messagesTree);

  const [isMindMapNodeLongPress, setIsMindMapNodeLongPress] = useRecoilState(
    store.isMindMapNodeLongPress(nodeId),
  );
  const [isMindMapNodePointerOver, setIsMindMapNodePointerOver] = useRecoilState(
    store.isMindMapNodePointerOver(nodeId),
  );
  const [isMindMapMagnifiedNodeCloseButtonPressed, setIsMindMapMagnifiedNodeCloseButtonPressed] =
    useRecoilState(store.isMindMapMagnifiedNodeCloseButtonPressed);
  const [mindMapMagnifiedNodeId, setMindMapMagnifiedNodeId] = useRecoilState(
    store.mindMapMagnifiedNodeId,
  );
  const [mindMapMagnifiedNodeData, setMindMapMagnifiedNodeData] = useRecoilState(
    store.mindMapMagnifiedNodeData,
  );
  let pressTimer: NodeJS.Timeout | null = null;
  let poiterOutTimer: NodeJS.Timeout | null = null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pressTimer = setTimeout(() => {
      console.log('setIsMindMapNodeLongPress: true, ' + nodeIndex?.toString());
      setIsMindMapNodeLongPress(true);
    }, 1);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (pressTimer) {
      console.log('setIsMindMapNodeLongPress: false, ' + nodeIndex?.toString());
      clearTimeout(pressTimer);
      pressTimer = null;
      if (!isMindMapNodePointerOver) {
        setIsMindMapNodeLongPress(false);
      }
    }
  };

  const handlePointerOver = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsMindMapNodePointerOver(true); // pointer over
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    poiterOutTimer = setTimeout(() => {
      if (poiterOutTimer) {
        clearTimeout(poiterOutTimer);
        poiterOutTimer = null;
      }
      setIsMindMapNodePointerOver(false);
      if (isMindMapNodeLongPress) {
        setIsMindMapNodeLongPress(false);
      }
    }, 500); // pointer leave after 500ms
  };

  useEffect(() => {
    if (isMindMapNodeLongPress) {
      setMindMapMagnifiedNodeId(nodeId);
      setMindMapMagnifiedNodeData(data);
      setIsMindMapMagnifiedNodeCloseButtonPressed(false);
    }
  }, [isMindMapNodeLongPress]);

  return (
    <div className="flex-1 overflow-hidden overflow-y-auto">
      <div className="dark:gpt-dark-gray relative h-full">
        <div
          onScroll={debouncedHandleScroll}
          ref={scrollableRef}
          style={{
            height: '100%',
            overflowY: 'auto',
            width: '100%',
          }}
        >
          <div
            className="flex flex-col pb-9 text-sm dark:bg-transparent"
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            {(_messagesTree && _messagesTree?.length == 0) || _messagesTree === null ? (
              <div className="flex w-full items-center justify-center gap-1 bg-gray-50 p-3 text-sm text-gray-500 dark:border-gray-900/50 dark:bg-gray-800 dark:text-gray-300">
                Nothing found
              </div>
            ) : (
              <>
                {Header && Header}
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                  ref={screenshotTargetRef}
                  onPointerOver={(e: React.PointerEvent<HTMLDivElement>) => handlePointerOver(e)}
                  onPointerLeave={(e: React.PointerEvent<HTMLDivElement>) => handlePointerLeave(e)}
                  onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => handlePointerDown(e)}
                  onPointerUp={(e: React.PointerEvent<HTMLDivElement>) => handlePointerUp(e)}
                >
                  <MultiMessage
                    key={conversationId} // avoid internal state mixture
                    id={0}
                    paramId={conversationId}
                    nodeId={nodeId}
                    messagesTree={_messagesTree}
                    messageId={conversationId ?? null}
                    setCurrentEditId={setCurrentEditId}
                    currentEditId={currentEditId ?? null}
                  />
                </div>
              </>
            )}
            <div
              className="dark:gpt-dark-gray group h-0 w-full flex-shrink-0 dark:border-gray-900/50"
              ref={messagesEndRef}
            />
          </div>
        </div>
        <CSSTransition
          in={showScrollButton}
          timeout={400}
          classNames="scroll-down"
          unmountOnExit={false}
          // appear
        >
          {() => showScrollButton && <ScrollToBottom scrollHandler={handleSmoothToRef} />}
        </CSSTransition>
      </div>
    </div>
  );
}
