import React, { createContext, useContext, useState, useEffect } from 'react';

interface SeniorModeContextType {
  isSeniorMode: boolean;
  toggleSeniorMode: () => void;
  setSeniorMode: (v: boolean) => void;
}

const SeniorModeContext = createContext<SeniorModeContextType | undefined>(undefined);

export const SeniorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSeniorMode, setIsSeniorMode] = useState(() => {
    return localStorage.getItem('isSeniorMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isSeniorMode', String(isSeniorMode));
    document.body.classList.toggle('senior-mode', isSeniorMode);
  }, [isSeniorMode]);

  const toggleSeniorMode = () => setIsSeniorMode(prev => !prev);
  const setSeniorMode = (v: boolean) => setIsSeniorMode(v);

  return (
    <SeniorModeContext.Provider value={{ isSeniorMode, toggleSeniorMode, setSeniorMode }}>
      {children}
    </SeniorModeContext.Provider>
  );
};

export const useSeniorMode = () => {
  const ctx = useContext(SeniorModeContext);
  if (!ctx) throw new Error('useSeniorMode must be used within SeniorModeProvider');
  return ctx;
};
