import { useSetRecoilState } from 'recoil';
import { useCallback } from 'react';
import store from '~/store';

const useMindMapConversations = () => {
  const setRefreshMindMapConversationsHint = useSetRecoilState(
    store.refreshMindMapConversationsHint,
  );

  const refreshMindMapConversations = useCallback(() => {
    setRefreshMindMapConversationsHint((prevState) => prevState + 1);
  }, [setRefreshMindMapConversationsHint]);

  return { refreshMindMapConversations };
};

export default useMindMapConversations;
