import React from 'react';
import { createEntityCardExtension } from '@backstage/plugin-catalog-react/alpha';
import { ExtensionDefinition } from '@backstage/frontend-plugin-api';

/**
 * @alpha
 */
export const entityAnnouncementsCard = createEntityCardExtension({
  name: 'announcements',
  loader: async () => {
    const { AnnouncementsCard } = await import(
      '../components/AnnouncementsCard'
    );

    return <AnnouncementsCard />;
  },
}) as ExtensionDefinition<{ filter?: string }>;
