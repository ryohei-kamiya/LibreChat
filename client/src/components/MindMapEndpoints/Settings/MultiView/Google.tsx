import Settings from '../Google';
import Examples from '../Examples';
import { useMindMapSetOptions } from '~/hooks';
import { useRecoilValue } from 'recoil';
import store from '~/store';

export default function GoogleView({ conversation, models, isPreset = false }) {
  const optionSettings = useRecoilValue(store.optionSettings);
  const { setOption, setExample, addExample, removeExample } = useMindMapSetOptions(
    isPreset ? conversation : null,
  );
  if (!conversation) {
    return null;
  }

  const { examples } = conversation;
  const { showExamples, isCodeChat } = optionSettings;
  return showExamples && !isCodeChat ? (
    <Examples
      examples={examples ?? []}
      setExample={setExample}
      addExample={addExample}
      removeExample={removeExample}
    />
  ) : (
    <Settings conversation={conversation} setOption={setOption} models={models} />
  );
}
