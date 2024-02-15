import { useParams, useNavigate } from 'react-router-dom';
import { MindMapIcon } from '~/components/svg';

export default function MindMapLink() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const clickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(`/m/${conversationId}`);
  };
  return (
    <a
      href={`/m/${conversationId}`}
      onClick={clickHandler}
      className="m-2 flex cursor-pointer items-center gap-2 rounded-md p-2 dark:hover:bg-gray-900"
    >
      <MindMapIcon className="h-4 w-4 overflow-hidden" />
      <span className="h-auto max-w-full overflow-x-hidden">Mind Map</span>
    </a>
  );
}
