import { EdgeChange, NodeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { useRecoilState, useRecoilCallback } from 'recoil';
import store from '~/store';

const useMindMapHelpers = () => {
  const [mindMapNodes, setMindMapNodes] = useRecoilState(store.mindMapNodes);
  const [mindMapEdges, setMindMapEdges] = useRecoilState(store.mindMapEdges);
  const [isMindMapMagnifiedNodeCloseButtonPressed, setIsMindMapMagnifiedNodeCloseButtonPressed] =
    useRecoilState(store.isMindMapMagnifiedNodeCloseButtonPressed);

  const onNodesChange = (changes: NodeChange[]) => {
    setMindMapNodes(applyNodeChanges(changes, mindMapNodes));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    setMindMapEdges(applyEdgeChanges(changes, mindMapEdges));
  };

  const resetSubmissions = useRecoilCallback(
    ({ reset }) =>
      (indices: string[]) => {
        indices.forEach((index) => {
          reset(store.submissionByIndex(index));
        });
      },
    [],
  );

  return {
    onNodesChange,
    onEdgesChange,
    setMindMapNodes,
    setMindMapEdges,
    setIsMindMapMagnifiedNodeCloseButtonPressed,
    resetSubmissions,
    mindMapNodes,
    mindMapEdges,
    isMindMapMagnifiedNodeCloseButtonPressed,
  };
};

export default useMindMapHelpers;
