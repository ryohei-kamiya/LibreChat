import conversation from './conversation';
import conversations from './conversations';
import mindMapConversation from './mindMapConversation';
import mindMapConversations from './mindMapConversations';
import mindMapNode from './mindMapNode';
import families from './families';
import endpoints from './endpoints';
import models from './models';
import user from './user';
import text from './text';
import toast from './toast';
import submission from './submission';
import search from './search';
import preset from './preset';
import lang from './language';
import settings from './settings';

export default {
  ...families,
  ...conversation,
  ...conversations,
  ...mindMapConversation,
  ...mindMapConversations,
  ...mindMapNode,
  ...endpoints,
  ...models,
  ...user,
  ...text,
  ...toast,
  ...submission,
  ...search,
  ...preset,
  ...lang,
  ...settings,
};
