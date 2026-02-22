import React, { createContext, useContext, useState, useEffect } from 'react';

interface SeniorModeContextType {
  isSeniorMode: boolean;
  toggle: () => void;
}

const SeniorModeContext = createContext<SeniorModeContextType>({ isSeniorMode: false, toggle: () => {} });

export const SeniorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSeniorMode, setIsSeniorMode] = useState(() => localStorage.getItem('seniorMode') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('senior-mode', isSeniorMode);
    localStorage.setItem('seniorMode', String(isSeniorMode));
  }, [isSeniorMode]);

  return (
    <SeniorModeContext.Provider value={{ isSeniorMode, toggle: () => setIsSeniorMode(p => !p) }}>
      {children}
    </SeniorModeContext.Provider>
  );
};

export const useSeniorMode = () => useContext(SeniorModeContext);
