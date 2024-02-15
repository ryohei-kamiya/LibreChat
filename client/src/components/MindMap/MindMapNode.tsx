import React, { memo, useState, useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { GripVertical } from 'lucide-react';
import Message from './Messages/Message';
import ScrollToBottom from '~/components/Messages/ScrollToBottom';
import { useScreenshot, useMessageScrolling } from '~/hooks';
import { CSSTransition } from 'react-transition-group';
import type { NodeData } from '~/store/mindMapNode';
import store from '~/store';

import { Handle, Position, NodeProps } from 'reactflow';

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

  const [isMindMapNodePressed, setIsMindMapNodePressed] = useState(false);
  const setIsMindMapMagnifiedNodeCloseButtonPressed = useSetRecoilState(
    store.isMindMapMagnifiedNodeCloseButtonPressed,
  );
  const setMindMapMagnifiedNodeId = useSetRecoilState(store.mindMapMagnifiedNodeId);
  const setMindMapMagnifiedNodeData = useSetRecoilState(store.mindMapMagnifiedNodeData);

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsMindMapMagnifiedNodeCloseButtonPressed(false);
    setIsMindMapNodePressed(true);
  };

  useEffect(() => {
    if (isMindMapNodePressed) {
      setMindMapMagnifiedNodeId(id);
      setMindMapMagnifiedNodeData(data);
      setIsMindMapNodePressed(false);
    }
  }, [isMindMapNodePressed]);

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
          <div
            className="flex h-full flex-col pb-9 text-sm dark:bg-transparent"
            onPointerUp={(e: React.PointerEvent<HTMLDivElement>) => handlePointerUp(e)}
          >
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
                    message={message}
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

const MindMapNode: React.FC<NodeProps<NodeData>> = ({ id, data }) => {
  const { messagesTree } = data;

  return (
    <>
      {!!messagesTree && messagesTree.length > 0 && messagesTree[0].text.length === 0 ? (
        <></>
      ) : (
        <div
          id={id}
          className="border-black/10 bg-white dark:border-gray-900/50 dark:bg-gray-800 dark:text-gray-100 dark:text-gray-20"
          style={{
            width: 1000,
            height: 400,
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            borderRadius: '2px',
            border: '1px solid',
            padding: 0,
            margin: 0,
            pointerEvents: 'all',
          }}
        >
          <div className="mindMapDragHandle bg-black text-white dark:bg-white dark:text-black">
            <GripVertical className="m-auto h-8 w-8" />
          </div>
          <div
            className="border-black/10 bg-white dark:border-gray-900/50 dark:bg-gray-800 dark:text-gray-20"
            style={{
              zIndex: 20,
              color: '#333',
              padding: '8px',
              margin: 0,
              display: 'flex',
              justifyContent: 'left',
              pointerEvents: 'all',
              cursor: 'default',
              width: '100%',
              height: '100%',
            }}
          >
            <MindMapNodeMessages id={id} data={data} />
          </div>
          <Handle type="target" position={Position.Top} />
          <Handle type="source" position={Position.Top} />
        </div>
      )}
    </>
  );
};

export default memo(MindMapNode);
