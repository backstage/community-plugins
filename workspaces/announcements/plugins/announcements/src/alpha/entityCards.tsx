import React from 'react';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityAnnouncementsCard = EntityCardBlueprint.make({
  name: 'announcements',
  params: {
    filter: 'kind:component,system',
    loader: async () => {
      const { AnnouncementsCard } = await import(
        '../components/AnnouncementsCard'
      );

      return <AnnouncementsCard />;
    },
  },
});
