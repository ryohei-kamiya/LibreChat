import { useRecoilState } from 'recoil';
import type { ChangeEvent } from 'react';
import { TMessage } from 'librechat-data-provider';
import { useMindMapRequiresKey, useMindMapHelpers, useMindMapNodeHandler } from '~/hooks';
import AttachFile from './Files/AttachFile';
import StopButton from './StopButton';
import SendButton from './SendButton';
import Images from './Files/Images';
import Textarea from './Textarea';
import type { NodeData } from '~/store/mindMapNode';
import store from '~/store';

export default function ChatForm({ nodeId, data }: { nodeId: string; data: NodeData }) {
  const { messagesTree, conversationId, nodeIndex } = data;
  const parentMessage = messagesTree?.[0];
  const [text, setText] = useRecoilState(store.textByIndex(nodeId ?? store.initNodeId));
  const {
    files,
    isSubmitting,
    showStopButton,
    filesLoading,
    setFiles,
    setFilesLoading,
    setShowStopButton,
  } = useMindMapNodeHandler(nodeId);
  const { ask, handleStopGenerating, mindMapConversation } = useMindMapHelpers(
    0,
    conversationId,
    nodeId,
  );

  const submitMessage = () => {
    console.log('submitMessage', text, parentMessage?.messageId);
    if (parentMessage) {
      ask({ text, conversationId: conversationId, parentMessageId: parentMessage.messageId });
    } else {
      ask({ text });
    }
    setText('');
  };

  const { requiresKey } = useMindMapRequiresKey(0, conversationId, nodeId);
  const { endpoint: _endpoint, endpointType } = mindMapConversation ?? { endpoint: null };
  const endpoint = endpointType ?? _endpoint;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitMessage();
      }}
      className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
    >
      <div className="relative flex h-full flex-1 items-stretch md:flex-col">
        <div className="flex w-full items-center">
          <div className="[&:has(textarea:focus)]:border-token-border-xheavy border-token-border-heavy shadow-xs dark:shadow-xs relative flex w-full flex-grow flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.95)] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:shadow-[0_0_0_2px_rgba(52,53,65,0.95)] [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)]">
            <Images files={files} setFiles={setFiles} setFilesLoading={setFilesLoading} />
            {endpoint && (
              <Textarea
                value={text}
                disabled={requiresKey}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                setText={setText}
                submitMessage={submitMessage}
                endpoint={endpoint}
              />
            )}
            <AttachFile endpoint={endpoint ?? ''} disabled={requiresKey} />
            {isSubmitting && showStopButton ? (
              <StopButton stop={handleStopGenerating} setShowStopButton={setShowStopButton} />
            ) : (
              endpoint && (
                <SendButton text={text} disabled={filesLoading || isSubmitting || requiresKey} />
              )
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
