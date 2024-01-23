/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Outlet, useLocation } from 'react-router-dom';
import { useGetModelsQuery, useGetSearchEnabledQuery } from 'librechat-data-provider/react-query';
import type { ContextType } from '~/common';
import {
  useAuthContext,
  useServerStream,
  useMindMapConversation,
  useMindMapNodeHandler,
} from '~/hooks';
import { MindMapNav, MobileMindMapNav } from '~/components/MindMapNav';
import store from '~/store';

export default function MindMapRoot() {
  const location = useLocation();
  const { newMindMapConversation } = useMindMapConversation();
  const { isAuthenticated } = useAuthContext();
  const [navVisible, setNavVisible] = useState(() => {
    const savedNavVisible = localStorage.getItem('navVisible');
    return savedNavVisible !== null ? JSON.parse(savedNavVisible) : true;
  });

  const submission = useRecoilValue(store.submission);
  useServerStream(submission ?? null);

  const modelsQueryEnabled = useRecoilValue(store.modelsQueryEnabled);
  const setIsSearchEnabled = useSetRecoilState(store.isSearchEnabled);
  const setModelsConfig = useSetRecoilState(store.modelsConfig);

  const searchEnabledQuery = useGetSearchEnabledQuery({ enabled: isAuthenticated });
  const modelsQuery = useGetModelsQuery({ enabled: isAuthenticated && modelsQueryEnabled });

  useEffect(() => {
    localStorage.setItem('navVisible', JSON.stringify(navVisible));
  }, [navVisible]);

  useEffect(() => {
    if (modelsQuery.data) {
      setModelsConfig(modelsQuery.data);
    } else if (modelsQuery.isError) {
      console.error('Failed to get models', modelsQuery.error);
    }
  }, [modelsQuery.data, modelsQuery.isError]);

  useEffect(() => {
    if (searchEnabledQuery.data) {
      setIsSearchEnabled(searchEnabledQuery.data);
    } else if (searchEnabledQuery.isError) {
      console.error('Failed to get search enabled', searchEnabledQuery.error);
    }
  }, [searchEnabledQuery.data, searchEnabledQuery.isError]);

  const { setIsMindMapMagnifiedNodeCloseButtonPressed, isMindMapMagnifiedNodeCloseButtonPressed } =
    useMindMapNodeHandler();

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMindMapMagnifiedNodeCloseButtonPressed) {
      setIsMindMapMagnifiedNodeCloseButtonPressed(true);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div
        className="flex h-screen"
        onPointerUp={(e: React.PointerEvent<HTMLDivElement>) => handlePointerUp(e)}
      >
        <MindMapNav navVisible={navVisible} setNavVisible={setNavVisible} />
        <div className="relative z-0 flex h-full w-full overflow-hidden">
          <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
            <MobileMindMapNav setNavVisible={setNavVisible} />
            <Outlet context={{ navVisible, setNavVisible } satisfies ContextType} />
          </div>
        </div>
      </div>
    </>
  );
}
