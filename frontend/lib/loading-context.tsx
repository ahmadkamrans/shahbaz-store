"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type LoadingContextValue = {
  loading: boolean;
  setLoading: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoadingState] = useState(false);
  const setLoading = useCallback((value: boolean) => {
    setLoadingState(value);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useSiteLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useSiteLoading must be used within LoadingProvider");
  }
  return ctx;
}
