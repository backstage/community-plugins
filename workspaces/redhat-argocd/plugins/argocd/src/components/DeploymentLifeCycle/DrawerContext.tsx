import React, { createContext, ReactNode } from 'react';
import { Application, History, RevisionInfo } from '../../types/application';

interface DrawerContextValue {
  application: Application;
  revisionsMap: { [key: string]: RevisionInfo };
  latestRevision: History;
  appHistory: History[];
}

interface DrawerContextProps {
  application: Application;
  revisionsMap: { [key: string]: RevisionInfo };
  children: ReactNode;
}

export const DrawerContext = createContext<DrawerContextValue>(
  undefined as any,
);

export const DrawerProvider: React.FC<DrawerContextProps> = ({
  application,
  revisionsMap,
  children,
}) => {
  const appHistory = application?.status?.history ?? [];
  const latestRevision = appHistory[appHistory.length - 1];

  return (
    <DrawerContext.Provider
      value={{
        application,
        appHistory,
        latestRevision,
        revisionsMap,
      }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawerContext = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawerContext must be used within an DrawerProvider');
  }
  return context;
};
