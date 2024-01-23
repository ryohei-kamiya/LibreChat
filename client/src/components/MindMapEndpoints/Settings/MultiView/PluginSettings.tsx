import Settings from '../Plugins';
import AgentSettings from '../AgentSettings';
import { useSetIndexOptions, useMindMapHelpers, useMindMapNodeHandler } from '~/hooks';

export default function PluginsView({
  id = 0,
  paramId = undefined,
  nodeId = undefined,
  conversation,
  models,
  isPreset = false,
}) {
  const { showAgentSettings } = useMindMapNodeHandler(nodeId);
  const { setOption, setAgentOption } = useSetIndexOptions(isPreset ? conversation : null);
  if (!conversation) {
    return null;
  }

  return showAgentSettings ? (
    <AgentSettings conversation={conversation} setOption={setAgentOption} models={models} />
  ) : (
    <Settings conversation={conversation} setOption={setOption} models={models} />
  );
}
