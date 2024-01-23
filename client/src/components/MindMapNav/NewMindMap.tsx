import { useNavigate } from 'react-router-dom';
import { useLocalize, useMindMapConversation, useNewMindMapConvo } from '~/hooks';

export default function NewMindMap({ toggleNav }: { toggleNav: () => void }) {
  const { newMindMapConversation } = useMindMapConversation();
  const { newMindMapConversation: newMindMapConvo } = useNewMindMapConvo();
  const navigate = useNavigate();
  const localize = useLocalize();

  const clickHandler = () => {
    newMindMapConvo();
    newMindMapConversation();
    navigate('/m/c/new');
    toggleNav();
  };

  return (
    <a
      data-testid="nav-new-chat-button"
      onClick={clickHandler}
      className="flex h-11 flex-shrink-0 flex-grow cursor-pointer items-center gap-3 rounded-md border border-white/20 px-3 py-3 text-sm text-white transition-colors duration-200 hover:bg-gray-500/10"
    >
      <svg
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      {localize('com_ui_new_chat')}
    </a>
  );
}
