import { atom } from 'recoil';

const refreshMindMapConversationsHint = atom<number>({
  key: 'refreshMindMapConversationsHint',
  default: 1,
});

export default { refreshMindMapConversationsHint };
