import { atom } from 'recoil';
import { Edge, Node } from 'reactflow';
import type { TMessage } from 'librechat-data-provider';

const initNodeId = '00000000-0000-0000-0000-000000000000';

const isMindMapMagnifiedNodeCloseButtonPressed = atom<boolean>({
  key: 'isMindMapMagnifiedNodeCloseButtonPressed',
  default: true,
});

const mindMapMagnifiedNodeId = atom<string>({
  key: 'mindMapMagnifiedNodeId',
  default: '',
});

const mindMapMagnifiedNodeData = atom<object>({
  key: 'mindMapMagnifiedNodeData',
  default: {},
});

export type NodeData = {
  messagesTree?: TMessage[] | null;
  conversationId?: string;
  nodeIndex?: number;
  isNew?: boolean;
};

const mindMapNodes = atom<Node<NodeData>[]>({
  key: 'mindMapNodes',
  default: [],
});

const mindMapEdges = atom<Edge[]>({
  key: 'mindMapEdges',
  default: [],
});

export default {
  initNodeId,
  isMindMapMagnifiedNodeCloseButtonPressed,
  mindMapMagnifiedNodeId,
  mindMapMagnifiedNodeData,
  mindMapNodes,
  mindMapEdges,
};
