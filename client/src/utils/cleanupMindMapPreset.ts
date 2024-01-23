import { parseConvo } from 'librechat-data-provider';
import type { TPreset } from 'librechat-data-provider';

type TCleanupMindMapPreset = {
  mindMapPreset: Partial<TPreset>;
};

const cleanupMindMapPreset = ({ mindMapPreset: _preset }: TCleanupMindMapPreset): TPreset => {
  const { endpoint, endpointType } = _preset;
  if (!endpoint) {
    console.error(`Unknown endpoint ${endpoint}`, _preset);
    return {
      endpoint: null,
      presetId: _preset?.presetId ?? null,
      title: _preset?.title ?? 'New Preset',
    };
  }

  const parsedPreset = parseConvo({ endpoint, endpointType, conversation: _preset });

  return {
    presetId: _preset?.presetId ?? null,
    ...parsedPreset,
    endpoint,
    endpointType,
    title: _preset?.title ?? 'New Preset',
  } as TPreset;
};

export default cleanupMindMapPreset;
