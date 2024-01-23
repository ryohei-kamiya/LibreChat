import MindMapConvo from './MindMapConvo';
import { TConversation } from 'librechat-data-provider';

export default function MindMapConversations({
  conversations,
  moveToTop,
  toggleNav,
}: {
  conversations: TConversation[];
  moveToTop: () => void;
  toggleNav: () => void;
}) {
  const ConvoItem = MindMapConvo;

  return (
    <>
      {conversations &&
        conversations.length > 0 &&
        conversations.map((convo: TConversation, i) => {
          return (
            <ConvoItem
              key={convo.conversationId}
              conversation={convo}
              retainView={moveToTop}
              toggleNav={toggleNav}
              i={i}
            />
          );
        })}
    </>
  );
}
