import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import type { TMessageProps } from '~/common';
// eslint-disable-next-line import/no-cycle
import Message from './Message';
import store from '~/store';

export default function MultiMessage({
  // messageId is used recursively here
  id,
  paramId,
  nodeId,
  messageId,
  messagesTree,
  currentEditId,
  setCurrentEditId,
}: TMessageProps) {
  const [siblingIdx, setSiblingIdx] = useRecoilState(
    store.mindMapMessagesSiblingIdxFamily(messageId),
  );

  const setSiblingIdxRev = (value: number) => {
    setSiblingIdx((messagesTree?.length ?? 0) - value - 1);
  };

  useEffect(() => {
    // reset siblingIdx when the tree changes, mostly when a new message is submitting.
    setSiblingIdx(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesTree?.length]);

  useEffect(() => {
    if (messagesTree?.length && siblingIdx >= messagesTree?.length) {
      setSiblingIdx(0);
    }
  }, [siblingIdx, messagesTree?.length, setSiblingIdx]);

  if (!(messagesTree && messagesTree?.length)) {
    return null;
  }

  const message = messagesTree[messagesTree.length - siblingIdx - 1];

  if (!message) {
    return null;
  }

  return (
    <Message
      key={message.messageId}
      id={id}
      paramId={paramId}
      nodeId={nodeId}
      message={message}
      currentEditId={currentEditId}
      setCurrentEditId={setCurrentEditId}
      siblingIdx={messagesTree.length - siblingIdx - 1}
      siblingCount={messagesTree.length}
      setSiblingIdx={setSiblingIdxRev}
    />
  );
}
