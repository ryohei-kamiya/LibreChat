import { useRecoilValue } from 'recoil';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetConvoIdQuery,
  useGetModelsQuery,
  useGetEndpointsQuery,
} from 'librechat-data-provider/react-query';
import { TPreset } from 'librechat-data-provider';
import { useNewMindMapConvo, useConfigOverride, useMindMapNodeHandler } from '~/hooks';
import MindMapView from '~/components/MindMap/MindMapView';
import useAuthRedirect from './useAuthRedirect';
import { Spinner } from '~/components/svg';
import store from '~/store';

export default function MindMapRoute() {
  const index = 0;
  useConfigOverride();
  const { conversationId } = useParams();
  const { mindMapConversation } = store.useCreateMindMapConversationAtom(index);
  const modelsQueryEnabled = useRecoilValue(store.modelsQueryEnabled);
  const { isAuthenticated } = useAuthRedirect();
  const { newMindMapConversation } = useNewMindMapConvo();
  const { setIsMindMapMagnifiedNodeCloseButtonPressed } = useMindMapNodeHandler();
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
      newMindMapConversation({ modelsData: modelsQuery.data });
      hasSetMindMapConversation.current = true;
    } else if (
      initialConvoQuery.data &&
      endpointsQuery.data &&
      modelsQuery.data &&
      !hasSetMindMapConversation.current
    ) {
      newMindMapConversation({
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
  if (mindMapConversation?.conversationId === 'search') {
    return null;
  }
  // if conversationId not match
  if (mindMapConversation?.conversationId !== conversationId && !mindMapConversation) {
    return null;
  }
  // if conversationId is null
  if (!conversationId) {
    return null;
  }

  return <MindMapView index={index} />;
}
