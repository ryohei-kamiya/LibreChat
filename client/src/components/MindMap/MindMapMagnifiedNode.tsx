import React, { memo, useState, useEffect } from 'react';
import { useMindMapHelpers, useMindMapNodeHandler } from '~/hooks';
// import GenerationButtons from './Input/GenerationButtons';
import MessagesView from './Messages/MessagesView';
// import OptionsBar from './Input/OptionsBar';
import { MindMapContext } from '~/Providers';
import Presentation from './Presentation';
import ChatForm from './Input/ChatForm';
import Landing from './Landing';
import Header from './Header';
import { useRecoilState } from 'recoil';
import type { NodeData } from '~/store/mindMapNode';
import store from '~/store';

import DragIcon from './DragIcon';
import CloseIcon from './CloseIcon';
import { Close } from '@radix-ui/react-toast';

function MindMapChatNode({ id, data }: { id: string; data: NodeData }) {
  const { messagesTree, conversationId, nodeIndex } = data;
  const { showStopButton, isSubmitting, mindMapNodes } = useMindMapNodeHandler(id);

  return (
    <MindMapContext.Provider value={useMindMapHelpers(0, conversationId, id)}>
      <Presentation>
        {messagesTree && messagesTree.length > 0 ? (
          <MessagesView
            nodeId={id}
            data={data}
            Header={<Header id={0} paramId={conversationId} nodeId={id} />}
          />
        ) : (
          <Landing
            id={0}
            paramId={conversationId}
            nodeId={id}
            Header={<Header id={0} paramId={conversationId} nodeId={id} />}
          />
        )}
        {/* <OptionsBar messagesTree={messagesTree} /> */}
        {/* <GenerationButtons id={0} paramId={conversationId} nodeId={id} endpoint={chatHelpers.conversation.endpoint ?? ''} /> */}
        {!messagesTree ||
        !messagesTree[0].children ||
        messagesTree[0].children.length === 0 ||
        (showStopButton && isSubmitting) ? (
            mindMapNodes.length <= 1 || (mindMapNodes.length > 1 && (nodeIndex ?? 0 > 0)) ? (
              <div className="w-full border-t-0 pl-0 pt-2 dark:border-white/20 md:w-[calc(100%-.5rem)] md:border-t-0 md:border-transparent md:pl-0 md:pt-0 md:dark:border-transparent">
                <ChatForm nodeId={id} data={data} />
              </div>
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
      </Presentation>
    </MindMapContext.Provider>
  );
}

function MindMapMagnifiedNode() {
  const [mindMapMagnifiedNodeId, setMindMapMagnifiedNodeId] = useRecoilState(
    store.mindMapMagnifiedNodeId,
  );
  const [mindMapMagnifiedNodeData, setMindMapMagnifiedNodeData] = useRecoilState(
    store.mindMapMagnifiedNodeData,
  );
  const {
    mindMapNodes,
    isMindMapMagnifiedNodeCloseButtonPressed,
    setIsMindMapMagnifiedNodeCloseButtonPressed,
  } = useMindMapNodeHandler(mindMapMagnifiedNodeId);
  const mindMapNodeData =
    mindMapNodes.find((node) => node.id === mindMapMagnifiedNodeId)?.data ??
    mindMapMagnifiedNodeData;
  const [isMindMapNodeLongPress, setIsMindMapNodeLongPress] = useRecoilState(
    store.isMindMapNodeLongPress(mindMapMagnifiedNodeId),
  );
  const [isMindMapNodePointerOver, setIsMindMapNodePointerOver] = useRecoilState(
    store.isMindMapNodePointerOver(mindMapMagnifiedNodeId),
  );
  const [style, setStyle] = useState({} as React.CSSProperties);

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsMindMapMagnifiedNodeCloseButtonPressed(true);
  };

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
        border: '1px solid #f6ad55',
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
        border: '1px solid #f6ad55',
        background: '#fff',
        padding: 0,
        margin: 0,
        pointerEvents: 'all',
      });
    }
    console.log(mindMapMagnifiedNodeId);
  }, [isMindMapMagnifiedNodeCloseButtonPressed]);

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
          <div className="closeMagnifiedNodeButton" onPointerUp={handlePointerUp}>
            ESC
            <CloseIcon />
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
            <MindMapChatNode id={mindMapMagnifiedNodeId} data={mindMapNodeData} />
          </div>
        </div>
      )}
    </>
  );
}

export default memo(MindMapMagnifiedNode);
