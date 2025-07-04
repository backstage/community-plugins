import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../api';
import { Tab } from './Tab';

/** @public */
export const MendTab = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Tab />
    </QueryClientProvider>
  );
};
