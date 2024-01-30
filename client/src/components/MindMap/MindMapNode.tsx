import React, { memo, useState, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useChatHelpers } from '~/hooks';
// import GenerationButtons from '~/components/Chat/Input/GenerationButtons';
import MessagesView from '~/components/Chat/Messages/MessagesView';
// import OptionsBar from '~/components/Chat/Input/OptionsBar';
import { ChatContext } from '~/Providers';
import Presentation from '~/components/Chat/Presentation';
import ChatForm from '~/components/Chat/Input/ChatForm';
import Landing from '~/components/Chat/Landing';
import Header from '~/components/Chat/Header';
import Footer from '~/components/Chat/Footer';
import type { NodeData } from '~/store/mindMapNode';
import store from '~/store';

import { Handle, Position, NodeProps } from 'reactflow';

import DragIcon from './DragIcon';

function MindMapChatNode({ id, data }: { id: string; data: NodeData }) {
  const { messagesTree, conversationId } = data;

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

  // const chatHelpers = useChatHelpers(id, conversationId);  // not working now
  const chatHelpers = useChatHelpers(0, conversationId);

  return (
    <ChatContext.Provider value={chatHelpers}>
      <Presentation>
        {messagesTree && messagesTree.length !== 0 ? (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              width: '100%',
            }}
            onPointerUp={(e: React.PointerEvent<HTMLDivElement>) => handlePointerUp(e)}
          >
            <MessagesView messagesTree={messagesTree} Header={<Header />} />
          </div>
        ) : (
          <Landing Header={<Header />} />
        )}
        {/* <OptionsBar messagesTree={messagesTree} /> */}
        {/* <GenerationButtons endpoint={chatHelpers.conversation.endpoint ?? ''} /> */}
        <div className="w-full border-t-0 pl-0 pt-2 dark:border-white/20 md:w-[calc(100%-.5rem)] md:border-t-0 md:border-transparent md:pl-0 md:pt-0 md:dark:border-transparent">
          {/* <ChatForm index={id} /> */}
          {/* <Footer /> */}
        </div>
      </Presentation>
    </ChatContext.Provider>
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
          style={{
            width: 1000,
            height: 400,
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            borderRadius: '2px',
            border: '1px solid #000000',
            background: '#fff',
            padding: 0,
            margin: 0,
            pointerEvents: 'all',
          }}
        >
          <div className="mindMapDragHandle dark bg-black">
            <DragIcon />
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
              height: '100%',
            }}
          >
            <MindMapChatNode id={id} data={data} />
          </div>
          <Handle type="target" position={Position.Top} />
          <Handle type="source" position={Position.Top} />
        </div>
      )}
    </>
  );
};

export default memo(MindMapNode);
