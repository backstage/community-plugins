import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../api';
import { Tab } from './Tab';

export const TabProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Tab />
    </QueryClientProvider>
  );
};
