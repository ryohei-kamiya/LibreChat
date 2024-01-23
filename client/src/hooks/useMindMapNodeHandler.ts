import { EdgeChange, NodeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { useRecoilState } from 'recoil';
import store from '~/store';

const useMindMapNodeHandler = (nodeId: string | undefined = undefined) => {
  const [mindMapNodes, setMindMapNodes] = useRecoilState(store.mindMapNodes);
  const [mindMapEdges, setMindMapEdges] = useRecoilState(store.mindMapEdges);
  const [isMindMapMagnifiedNodeCloseButtonPressed, setIsMindMapMagnifiedNodeCloseButtonPressed] =
    useRecoilState(store.isMindMapMagnifiedNodeCloseButtonPressed);
  const [files, setFiles] = useRecoilState(store.filesByIndex(nodeId ?? store.initNodeId));
  const [showStopButton, setShowStopButton] = useRecoilState(
    store.showStopButton(nodeId ?? store.initNodeId),
  );
  const [filesLoading, setFilesLoading] = useRecoilState(
    store.filesLoading(nodeId ?? store.initNodeId),
  );
  const [isSubmitting, setIsSubmitting] = useRecoilState(
    store.isSubmittingFamily(nodeId ?? store.initNodeId),
  );
  const [showPopover, setShowPopover] = useRecoilState(
    store.showPopoverFamily(nodeId ?? store.initNodeId),
  );
  const [abortScroll, setAbortScroll] = useRecoilState(
    store.abortScrollFamily(nodeId ?? store.initNodeId),
  );
  const [mindMapPreset, setMindMapPreset] = useRecoilState(
    store.mindMapPresetByIndex(nodeId ?? store.initNodeId),
  );
  const [optionSettings, setOptionSettings] = useRecoilState(
    store.optionSettingsFamily(nodeId ?? store.initNodeId),
  );
  const [showAgentSettings, setShowAgentSettings] = useRecoilState(
    store.showAgentSettingsFamily(nodeId ?? store.initNodeId),
  );
  const [showBingToneSetting, setShowBingToneSetting] = useRecoilState(
    store.showBingToneSettingFamily(nodeId ?? store.initNodeId),
  );

  const onNodesChange = (changes: NodeChange[]) => {
    setMindMapNodes(applyNodeChanges(changes, mindMapNodes));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    setMindMapEdges(applyEdgeChanges(changes, mindMapEdges));
  };

  return {
    setFiles,
    setShowStopButton,
    setFilesLoading,
    setIsSubmitting,
    setShowPopover,
    setAbortScroll,
    setMindMapPreset,
    setOptionSettings,
    setShowAgentSettings,
    setShowBingToneSetting,
    onNodesChange,
    onEdgesChange,
    setMindMapNodes,
    setMindMapEdges,
    setIsMindMapMagnifiedNodeCloseButtonPressed,
    files,
    showStopButton,
    filesLoading,
    isSubmitting,
    showPopover,
    abortScroll,
    mindMapPreset,
    optionSettings,
    showAgentSettings,
    showBingToneSetting,
    mindMapNodes,
    mindMapEdges,
    isMindMapMagnifiedNodeCloseButtonPressed,
  };
};

export default useMindMapNodeHandler;
