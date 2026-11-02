import { createContext, useContext, type ReactNode } from 'react';

export type AppCanvasChromeValue = {
  projectId?: string;
  showShare?: boolean;
  showUpgrade?: boolean;
};

const AppCanvasChromeContext = createContext<AppCanvasChromeValue>({});

export function AppCanvasChromeProvider({
  value,
  children,
}: {
  value: AppCanvasChromeValue;
  children: ReactNode;
}) {
  return <AppCanvasChromeContext.Provider value={value}>{children}</AppCanvasChromeContext.Provider>;
}

export function useAppCanvasChrome() {
  return useContext(AppCanvasChromeContext);
}
