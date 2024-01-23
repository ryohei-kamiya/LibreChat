import React, { memo, useState, useEffect } from 'react';
import { useMindMapHelpers } from '~/hooks';
// import GenerationButtons from './Input/GenerationButtons';
import MessagesView from './Messages/MessagesView';
// import OptionsBar from './Input/OptionsBar';
import { MindMapContext } from '~/Providers';
import Presentation from './Presentation';
import ChatForm from './Input/ChatForm';
import Landing from './Landing';
import Header from './Header';
import StopButton from './Input/StopButton';
import type { NodeData } from '~/store/mindMapNode';
import { useMindMapSSE, useMindMapNodeHandler } from '~/hooks';
import { useRecoilValue } from 'recoil';
import store from '~/store';

import { Handle, Position, NodeProps } from 'reactflow';

import DragIcon from './DragIcon';

function MindMapChatNode({ id, data }: { id: string; data: NodeData }) {
  const { messagesTree, conversationId, nodeIndex } = data;
  const submissionAtNode = useRecoilValue(store.submissionByNodeId(id));
  const { showStopButton, isSubmitting, mindMapNodes } = useMindMapNodeHandler(id);
  const { initMindMapNodeStates } = useMindMapHelpers(0, conversationId, id);
  useEffect(() => {
    initMindMapNodeStates();
  }, [id, messagesTree]);
  useMindMapSSE(submissionAtNode, 0, id);

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

const MindMapNode: React.FC<NodeProps<NodeData>> = ({ id, data }) => {
  const { messagesTree, conversationId, nodeIndex } = data;

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
            border: '1px solid #f6ad55',
            background: '#fff',
            padding: 0,
            margin: 0,
            pointerEvents: 'all',
          }}
        >
          <div className="dragHandle">
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
