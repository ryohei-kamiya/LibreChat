import { createContext, useContext } from 'react';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
type TMindMapContext = ReturnType<typeof useMindMapHelpers>;

export const MindMapContext = createContext<TMindMapContext>({} as TMindMapContext);
export const useMindMapContext = () => useContext(MindMapContext);
