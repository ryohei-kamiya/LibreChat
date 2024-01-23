import { atom, selector, atomFamily } from 'recoil';
import { TConversation, TMessagesAtom, TMessage } from 'librechat-data-provider';
import { buildTree } from '~/utils';

const mindMapConversation = atom<TConversation | null>({
  key: 'mindMapConversation',
  default: null,
});

// current messages of the conversation, must be an array
// sample structure
// [{text, sender, messageId, parentMessageId, isCreatedByUser}]
const mindMapMessages = atom<TMessagesAtom>({
  key: 'mindMapMessages',
  default: [],
});

const mindMapMessagesTree = selector({
  key: 'mindMapMessagesTree',
  get: ({ get }) => {
    return buildTree({ messages: get(mindMapMessages) });
  },
});

const latestMindMapMessage = atom<TMessage | null>({
  key: 'latestMindMapMessage',
  default: null,
});

const mindMapMessagesSiblingIdxFamily = atomFamily<number, string | null | undefined>({
  key: 'mindMapMessagesSiblingIdx',
  default: 0,
});

export default {
  mindMapMessages,
  mindMapConversation,
  mindMapMessagesTree,
  latestMindMapMessage,
  mindMapMessagesSiblingIdxFamily,
};
