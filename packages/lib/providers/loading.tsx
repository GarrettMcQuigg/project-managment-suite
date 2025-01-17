'use client';

import React from 'react';
import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

type LoadingContextProps = {
  isLoading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

const LoadingContext = createContext<LoadingContextProps>({
  isLoading: false,
  setLoading: (): boolean => false
});

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setLoading] = useState<boolean>(false);

  return <LoadingContext.Provider value={{ isLoading, setLoading }}>{children}</LoadingContext.Provider>;
}

export const useLoading = (): LoadingContextProps => useContext(LoadingContext);
