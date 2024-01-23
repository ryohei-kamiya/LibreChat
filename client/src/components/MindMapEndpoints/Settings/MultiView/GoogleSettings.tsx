import Settings from '../Google';
import Examples from '../Examples';
import { useSetIndexOptions, useMindMapNodeHandler } from '~/hooks';

export default function GoogleView({
  id = 0,
  paramId = undefined,
  nodeId = undefined,
  conversation,
  models,
  isPreset = false,
}) {
  const { optionSettings } = useMindMapNodeHandler(nodeId);
  const { setOption, setExample, addExample, removeExample } = useSetIndexOptions(
    isPreset ? conversation : null,
  );
  if (!conversation) {
    return null;
  }

  const { examples, model } = conversation;
  const isGenerativeModel = model?.toLowerCase()?.includes('gemini');
  const isChatModel = !isGenerativeModel && model?.toLowerCase()?.includes('chat');
  const isTextModel = !isGenerativeModel && !isChatModel && /code|text/.test(model ?? '');
  const { showExamples } = optionSettings;
  return showExamples && isChatModel && !isTextModel ? (
    <Examples
      examples={examples ?? [{ input: { content: '' }, output: { content: '' } }]}
      setExample={setExample}
      addExample={addExample}
      removeExample={removeExample}
    />
  ) : (
    <Settings conversation={conversation} setOption={setOption} models={models} />
  );
}
