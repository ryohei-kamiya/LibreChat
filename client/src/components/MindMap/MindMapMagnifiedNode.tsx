import React, { memo, useState, useEffect } from 'react';
import useChatHelpers from '~/hooks/useChatHelpers';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
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
import { useRecoilValue } from 'recoil';
import store from '~/store';
import CloseIcon from './CloseIcon';

function MindMapChatNode({ id, data }: { id: string; data: NodeData }) {
  const { messagesTree, conversationId } = data;

  // const chatHelpers = useChatHelpers(id, conversationId);  // not working now
  const chatHelpers = useChatHelpers(0, conversationId);

  return (
    <ChatContext.Provider value={chatHelpers}>
      <Presentation>
        {messagesTree && messagesTree.length !== 0 ? (
          <MessagesView messagesTree={messagesTree} Header={<Header />} />
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
