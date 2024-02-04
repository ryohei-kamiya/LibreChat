import React, { memo, useState, useEffect } from 'react';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
import Message from '~/components/Messages/Message';
import ScrollToBottom from '~/components/Messages/ScrollToBottom';
import { useScreenshot, useMessageScrolling } from '~/hooks';
import { CSSTransition } from 'react-transition-group';
import type { NodeData } from '~/store/mindMapNode';
import { useRecoilValue } from 'recoil';
import store from '~/store';
import CrossIcon from '~/components/svg/CrossIcon';

function MindMapNodeMessages({ id, data }: { id: string; data: NodeData }) {
  const { messagesTree } = data;

  const { screenshotTargetRef } = useScreenshot();
  const [currentEditId, setCurrentEditId] = useState<number | string | null>(-1);

  const {
    conversation,
    scrollableRef,
    messagesEndRef,
    showScrollButton,
    handleSmoothToRef,
    debouncedHandleScroll,
  } = useMessageScrolling(messagesTree);

  if (!(messagesTree && messagesTree?.length)) {
    return null;
  }

  const message = !(messagesTree && messagesTree?.length) ? null : messagesTree[0];

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
          <div className="flex h-full flex-col pb-9 text-sm dark:bg-transparent">
            {!message ? (
              <div className="flex w-full items-center justify-center gap-1 bg-gray-50 p-3 text-sm text-gray-500 dark:border-gray-900/50 dark:bg-gray-800 dark:text-gray-300">
                Nothing found
              </div>
            ) : (
              <>
                <div ref={screenshotTargetRef}>
                  <Message
                    key={message.messageId}
                    conversation={conversation}
                    message={{
                      ...message,
                      bg: 'w-full text-gray-800 group border-black/10 dark:border-gray-900/50 dark:text-gray-100 bg-white dark:bg-gray-800 dark:text-gray-20',
                    }}
                    currentEditId={currentEditId}
                    setCurrentEditId={setCurrentEditId}
                    siblingIdx={0}
                    siblingCount={messagesTree.length}
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

function MindMapMagnifiedNode() {
  const mindMapMagnifiedNodeId = useRecoilValue(store.mindMapMagnifiedNodeId);
  const mindMapMagnifiedNodeData = useRecoilValue(store.mindMapMagnifiedNodeData);
  const {
    mindMapNodes,
    isMindMapMagnifiedNodeCloseButtonPressed,
    setIsMindMapMagnifiedNodeCloseButtonPressed,
  } = useMindMapHelpers();
  const mindMapNodeData =
    mindMapNodes.find((node) => node.id === mindMapMagnifiedNodeId)?.data ??
    mindMapMagnifiedNodeData;
  const [style, setStyle] = useState({} as React.CSSProperties);

  useEffect(() => {
    if (!isMindMapMagnifiedNodeCloseButtonPressed) {
      setStyle({
        height: '100%',
        minWidth: '300px',
        maxWidth: '1000px',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
        display: 'flex',
        borderRadius: '2px',
        border: '1px solid #000000',
        background: '#fff',
        padding: 0,
        margin: 0,
        pointerEvents: 'all',
      });
    } else {
      setStyle({
        height: '100%',
        minWidth: 300,
        maxWidth: 1000,
        position: 'relative',
        zIndex: 1000,
        display: 'none',
        borderRadius: '2px',
        border: '1px solid #000000',
        background: '#fff',
        padding: 0,
        margin: 0,
        pointerEvents: 'all',
      });
    }
  }, [isMindMapMagnifiedNodeCloseButtonPressed]);

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsMindMapMagnifiedNodeCloseButtonPressed(true);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      setIsMindMapMagnifiedNodeCloseButtonPressed(true);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const { messagesTree } = mindMapMagnifiedNodeData as NodeData;

  return (
    <>
      {!!messagesTree && messagesTree.length > 0 && messagesTree[0].text.length === 0 ? (
        <></>
      ) : (
        <div
          id={mindMapMagnifiedNodeId}
          style={style}
          onPointerUp={(e) => {
            e.stopPropagation();
          }}
        >
          <div
            className="mindMapCloseMagnifiedNodeButton dark bg-black"
            onPointerUp={handlePointerUp}
          >
            ESC
            <CrossIcon className="mindMapCloseMagnifiedNodeButtonIcon" />
          </div>
          <div
            style={{
              zIndex: 20,
              color: '#333',
              background: '#fff',
              padding: '8px',
              margin: 0,
              display: 'flex',
              justifyContent: 'left',
              pointerEvents: 'all',
              cursor: 'default',
              width: '100%',
            }}
          >
            <MindMapNodeMessages id={mindMapMagnifiedNodeId} data={mindMapNodeData} />
          </div>
        </div>
      )}
    </>
  );
}

export default memo(MindMapMagnifiedNode);
