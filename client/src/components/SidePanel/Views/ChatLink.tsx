import { useParams, useNavigate } from 'react-router-dom';
import ConvoIcon from '~/components/svg/ConvoIcon';

export default function ChatLink() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const clickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(`/c/${conversationId}`);
  };
  return (
    <a
      href={`/c/${conversationId}`}
      onClick={clickHandler}
      className="m-2 flex cursor-pointer items-center gap-2 rounded-md p-2 dark:hover:bg-gray-900"
    >
      <ConvoIcon className="h-4 w-4 overflow-hidden" />
      <span className="h-auto max-w-full overflow-x-hidden">Chat</span>
    </a>
  );
}
