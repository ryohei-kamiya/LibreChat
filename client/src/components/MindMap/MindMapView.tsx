import Dagre from '@dagrejs/dagre';
import { memo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import type { TMessage } from 'librechat-data-provider';
import { useGetMessagesByConvoId } from 'librechat-data-provider/react-query';
import { useGetFiles } from '~/data-provider';
import { buildTree, mapFiles } from '~/utils';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
import store from '~/store';

import { Spinner, MindMapSortIcon } from '~/components/svg';

import ReactFlow, {
  Edge,
  Node,
  ReactFlowProvider,
  ConnectionLineType,
  NodeOrigin,
  Controls,
  ControlButton,
} from 'reactflow';
import type { NodeData } from '~/store/mindMapNode';

import MindMapEdge from './MindMapEdge';
import MindMapNode from './MindMapNode';
import MindMapMagnifiedNode from './MindMapMagnifiedNode';

// we need to import the React Flow styles to make it work
import 'reactflow/dist/style.css';

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = { stroke: '#000000', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

const g = new Dagre.graphlib.Graph();
g.setGraph({});
g.setDefaultEdgeLabel(function () {
  return {};
});

function getNodeSize(node: Node<NodeData>) {
  const width = 1000;
  const height = 400;
  return { width, height };
}

function getLayoutedElements(nodes: Node<NodeData>[], edges: Edge[], direction: string) {
  if (!nodes || nodes.length === 0) {
    return { nodes: [], edges: [] };
  }
  if (!edges || edges.length === 0) {
    return { nodes: nodes, edges: [] };
  }
  g.setGraph({ rankdir: direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => g.setNode(node.id, { label: node.id, ...getNodeSize(node) }));

  Dagre.layout(g);
  const rootNode = nodes.find((node) => node.data!.nodeIndex === 0) ?? nodes[0];
  const rootNodePosition = g.node(rootNode.id);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);

      if (node.id === rootNode.id) {
        return { ...node, position: { x: 0, y: 0 } };
      } else {
        return { ...node, position: { x: x - rootNodePosition.x, y: y - rootNodePosition.y } };
      }
    }),
    edges: edges,
  };
}

function convertMessagesTreeToNodesAndEdges(
  nodes: Node<NodeData>[],
  edges: Edge[],
  messagesTree: TMessage[],
) {
  const nodesBuffer: { string?: Node<NodeData> } = {};
  const edgesBuffer: { string?: Edge } = {};
  function traverseNode(message: TMessage, rank = 0, nodeIndex = 0) {
    if (!message || !message.messageId) {
      return;
    }
    const node = {
      id: message.messageId,
      type: 'mindmap',
      data: {
        messagesTree: [structuredClone(message)],
        conversationId: message.conversationId ?? 'undefined',
        nodeIndex: nodeIndex,
        isNew: true,
      },
      width: 1000,
      height: 400,
      position: { x: 0, y: 0 },
      dragHandle: '.mindMapDragHandle',
    };
    if (rank == 0) {
      node.data.messagesTree[0].children?.forEach((child) => {
        const edgeId = `${node.data.messagesTree[0].messageId}_${child.messageId}_${nodeIndex}`;
        if (!edgesBuffer[edgeId]) {
          edgesBuffer[edgeId] = {
            id: edgeId,
            source: node.data.messagesTree[0].messageId,
            target: child.messageId,
          };
        }
      });
      node.data.messagesTree[0].children = [];
      if (!nodesBuffer[node.id]) {
        nodesBuffer[node.id] = node;
      }
    } else if (message.sender.toLocaleLowerCase() !== 'user') {
      node.data.messagesTree[0].children?.forEach((child) => {
        child.children?.forEach((grandchild) => {
          const edgeId = `${node.data.messagesTree[0].messageId}_${grandchild.messageId}_${nodeIndex}`;
          if (!edgesBuffer[edgeId]) {
            edgesBuffer[edgeId] = {
              id: edgeId,
              source: node.data.messagesTree[0].messageId,
              target: grandchild.messageId,
            };
          }
        });
        child.children = [];
      });
      if (!nodesBuffer[node.id]) {
        nodesBuffer[node.id] = node;
      }
    }
    if (message.children && message.children.length > 0) {
      for (let i = 0; i < message.children.length; i++) {
        const child = message.children[i];
        nodeIndex++;
        traverseNode(child, rank + 1, nodeIndex);
      }
    }
  }
  if (!messagesTree || messagesTree.length === 0) {
    return {
      nodes: [
        {
          id: store.initNodeId,
          type: 'mindmap',
          data: {
            messagesTree: null,
            conversationId: 'new',
            nodeIndex: 0,
            isNew: true,
          },
          width: 1000,
          height: 400,
          position: { x: 0, y: 0 },
          dragHandle: '.mindMapDragHandle',
        },
      ],
      edges: [],
    };
  } else {
    messagesTree.forEach((message) => traverseNode(message));
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
      Object.values(nodesBuffer),
      Object.values(edgesBuffer),
      'TB',
    );
    const mergedNodes = newNodes.map((newNode) => {
      const nodeInStore = nodes.find((n) => n.id === newNode.id);
      if (nodeInStore) {
        const result = { ...newNode, position: nodeInStore.position };
        result.data.isNew = false;
        return result;
      } else {
        const parentEdge = newEdges.find((edge) => edge.target === newNode.id);
        if (parentEdge) {
          const parentNode = nodes.find((n) => n.id === parentEdge.source);
          const parentNewNode = newNodes.find((n) => n.id === parentEdge.source);
          if (parentNode && parentNewNode) {
            newNode.position.x =
              parentNode.position.x + newNode.position.x - parentNewNode.position.x;
            newNode.position.y =
              parentNode.position.y + newNode.position.y - parentNewNode.position.y;
          }
        }
        return newNode;
      }
    });
    return { nodes: mergedNodes, edges: newEdges };
  }
}

function Flow() {
  const { conversationId } = useParams();

  const {
    onNodesChange,
    onEdgesChange,
    setMindMapNodes,
    setMindMapEdges,
    resetSubmissions,
    mindMapNodes,
    mindMapEdges,
  } = useMindMapHelpers();
  const setSubmission = useSetRecoilState(store.submission);
  const setSubmissionAtIndex = useSetRecoilState(store.submissionByIndex(0));

  const onSortView = () => {
    const layoutedNodesAndEdges = getLayoutedElements(mindMapNodes, mindMapEdges, 'TB');
    setMindMapNodes(layoutedNodesAndEdges.nodes);
    setMindMapEdges(layoutedNodesAndEdges.edges);
  };

  const { data: fileMap } = useGetFiles({
    select: mapFiles,
  });

  const { data: messagesTree = null, isLoading } = useGetMessagesByConvoId(conversationId ?? '', {
    select: (data) => {
      const dataTree = buildTree({ messages: data, fileMap });
      return dataTree?.length === 0 ? null : dataTree ?? null;
    },
    enabled: !!fileMap,
  });

  useEffect(() => {
    const { nodes: initNodes, edges: initEdges } = convertMessagesTreeToNodesAndEdges(
      mindMapNodes,
      mindMapEdges,
      messagesTree ?? [],
    );
    setSubmissionAtIndex(null);
    setSubmission(null);
    setMindMapNodes(initNodes);
    setMindMapEdges(initEdges);
  }, [messagesTree, setMindMapNodes, setMindMapEdges]);

  useEffect(() => {
    resetSubmissions(mindMapNodes.map((node) => node.id));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {!mindMapNodes || mindMapNodes.length == 0 || isLoading ? (
        <Spinner className="m-auto dark:text-white" />
      ) : (
        <>
          <ReactFlow
            nodes={mindMapNodes}
            edges={mindMapEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodeOrigin={nodeOrigin}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineStyle={connectionLineStyle}
            connectionLineType={ConnectionLineType.SimpleBezier}
            fitView={true}
            minZoom={0.01}
            proOptions={{
              hideAttribution: false,
            }}
          >
            <Controls showInteractive={true}>
              <ControlButton onClick={onSortView}>
                <MindMapSortIcon />
              </ControlButton>
            </Controls>
            {/* <Panel position="top-left" className="header">
              Mind Map
            </Panel> */}
          </ReactFlow>
          <MindMapMagnifiedNode />
        </>
      )}
    </div>
  );
}

function MindMapView(props) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}

export default memo(MindMapView);
