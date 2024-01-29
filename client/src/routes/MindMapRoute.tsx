import { useRecoilValue } from 'recoil';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetConvoIdQuery,
  useGetModelsQuery,
  useGetEndpointsQuery,
} from 'librechat-data-provider/react-query';
import { TPreset } from 'librechat-data-provider';
import { useNewConvo, useConfigOverride } from '~/hooks';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
import MindMapView from '~/components/MindMap/MindMapView';
import useAuthRedirect from './useAuthRedirect';
import { Spinner } from '~/components/svg';
import store from '~/store';

export default function MindMapRoute() {
  const index = 0;
  useConfigOverride();
  const { conversationId } = useParams();
  const { conversation } = store.useCreateConversationAtom(index);
  const modelsQueryEnabled = useRecoilValue(store.modelsQueryEnabled);
  const { isAuthenticated } = useAuthRedirect();
  const { newConversation } = useNewConvo();
  const { setIsMindMapMagnifiedNodeCloseButtonPressed } = useMindMapHelpers();
  const hasSetMindMapConversation = useRef(false);

  const modelsQuery = useGetModelsQuery({ enabled: isAuthenticated && modelsQueryEnabled });
  const initialConvoQuery = useGetConvoIdQuery(conversationId ?? '', {
    enabled: isAuthenticated && conversationId !== 'new',
  });
  const endpointsQuery = useGetEndpointsQuery({ enabled: isAuthenticated && modelsQueryEnabled });

  useEffect(() => {
    if (
      conversationId === 'new' &&
      endpointsQuery.data &&
      modelsQuery.data &&
      !hasSetMindMapConversation.current
    ) {
      newConversation({ modelsData: modelsQuery.data });
      hasSetMindMapConversation.current = true;
    } else if (
      initialConvoQuery.data &&
      endpointsQuery.data &&
      modelsQuery.data &&
      !hasSetMindMapConversation.current
    ) {
      newConversation({
        template: initialConvoQuery.data,
        /* this is necessary to load all existing settings */
        preset: initialConvoQuery.data as TPreset,
        modelsData: modelsQuery.data,
      });
      hasSetMindMapConversation.current = true;
    }
    setIsMindMapMagnifiedNodeCloseButtonPressed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConvoQuery.data, modelsQuery.data, endpointsQuery.data]);

  if (endpointsQuery.isLoading || modelsQuery.isLoading) {
    return <Spinner className="m-auto dark:text-white" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // if not a conversation
  if (conversation?.conversationId === 'search') {
    return null;
  }
  // if conversationId not match
  if (conversation?.conversationId !== conversationId && !conversation) {
    return null;
  }
  // if conversationId is null
  if (!conversationId) {
    return null;
  }

  return <MindMapView index={index} />;
}
