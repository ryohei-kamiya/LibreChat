import { atom, atomFamily } from 'recoil';
import { Edge, Node } from 'reactflow';
import type { TMessage, TSubmission } from 'librechat-data-provider';

const initNodeId = '00000000-0000-0000-0000-000000000000';

const showStopButton = atomFamily<boolean, string>({
  key: 'showStopButton',
  default: false,
});

const filesLoading = atomFamily<boolean, string>({
  key: 'filesLoading',
  default: false,
});

const submissionByNodeId = atomFamily<TSubmission | null, string>({
  key: 'submissionByNodeId',
  default: null,
});

const isMindMapNodeLongPress = atomFamily<boolean, string>({
  key: 'isMindMapNodeLongPress',
  default: false,
});

const isMindMapNodePointerOver = atomFamily<boolean, string>({
  key: 'isMindMapNodePointerOver',
  default: false,
});

const isMindMapMagnifiedNodePointerOver = atom<boolean>({
  key: 'isMindMapMagnifiedNodePointerOver',
  default: false,
});

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
  showStopButton,
  submissionByNodeId,
  filesLoading,
  isMindMapNodeLongPress,
  isMindMapNodePointerOver,
  isMindMapMagnifiedNodePointerOver,
  isMindMapMagnifiedNodeCloseButtonPressed,
  mindMapMagnifiedNodeId,
  mindMapMagnifiedNodeData,
  mindMapNodes,
  mindMapEdges,
};
