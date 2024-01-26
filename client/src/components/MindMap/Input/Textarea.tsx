import TextareaAutosize from 'react-textarea-autosize';
import { supportsFiles } from 'librechat-data-provider';
import { cn, removeFocusOutlines } from '~/utils';
import { useMindMapTextarea } from '~/hooks';

export default function Textarea({
  id = 0,
  paramId = undefined,
  nodeId = undefined,
  value,
  disabled,
  onChange,
  setText,
  submitMessage,
  endpoint,
}) {
  const {
    inputRef,
    handlePaste,
    handleKeyUp,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
  } = useMindMapTextarea({ id, paramId, nodeId, setText, submitMessage, disabled });

  return (
    <TextareaAutosize
      ref={inputRef}
      autoFocus
      value={value}
      disabled={!!disabled}
      onChange={onChange}
      onPaste={handlePaste}
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      id="prompt-textarea"
      tabIndex={0}
      data-testid="text-input"
      style={{ height: 44, overflowY: 'auto' }}
      rows={1}
      className={cn(
        supportsFiles[endpoint] ? ' pl-10 md:pl-[55px]' : 'pl-3 md:pl-4',
        'm-0 w-full resize-none border-0 bg-transparent py-[10px] pr-10 placeholder-black/50 focus:ring-0 focus-visible:ring-0 dark:bg-transparent dark:placeholder-white/50 md:py-3.5 md:pr-12 ',
        removeFocusOutlines,
        'max-h-52',
      )}
    />
  );
}