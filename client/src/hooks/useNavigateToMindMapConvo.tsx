import { useSetRecoilState, useResetRecoilState } from 'recoil';
import type { TConversation } from 'librechat-data-provider';
import useMindMapOriginNavigate from './useMindMapOriginNavigate';
import useSetStorage from './useSetStorage';
import store from '~/store';

const useNavigateToMindMapConvo = (index = 0) => {
  const setStorage = useSetStorage();
  const navigate = useMindMapOriginNavigate();
  const { setMindMapConversation } = store.useCreateMindMapConversationAtom(index);
  const setSubmission = useSetRecoilState(store.submissionByNodeId(store.initNodeId));
  // const setConversation = useSetRecoilState(store.conversationByIndex(index));
  const resetLatestMindMapMessage = useResetRecoilState(
    store.latestMindMapMessageFamily(store.initNodeId),
  );

  const navigateToMindMapConvo = (conversation: TConversation, _resetLatestMessage = true) => {
    if (!conversation) {
      console.log('Conversation not provided');
      return;
    }
    setSubmission(null);
    if (_resetLatestMessage) {
      resetLatestMindMapMessage();
    }
    setStorage(conversation);
    setMindMapConversation(conversation);
    navigate('/m/c/' + conversation?.conversationId);
  };

  return {
    navigateToMindMapConvo,
  };
};

export default useNavigateToMindMapConvo;
