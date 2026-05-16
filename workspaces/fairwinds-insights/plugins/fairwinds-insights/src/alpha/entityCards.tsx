/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Entity } from '@backstage/catalog-model';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

const FAIRWINDS_APP_GROUPS_ANNOTATION = 'insights.fairwinds.com/app-groups';

function isFairwindsInsightsAvailable(entity: Entity): boolean {
  const annotation =
    entity.metadata.annotations?.[FAIRWINDS_APP_GROUPS_ANNOTATION];
  const spec =
    (entity.spec as Record<string, unknown>)?.['app-groups'] ??
    (entity.spec as Record<string, unknown>)?.['app-group'];
  const value = annotation ?? spec;
  if (typeof value !== 'string') return false;
  const groups = value
    .split(',')
    .map((g: string) => g.trim())
    .filter((g: string) => g.length > 0);
  return groups.length > 0;
}

/**
 * @alpha
 */
export const entityActionItemsCard = EntityCardBlueprint.makeWithOverrides({
  name: 'action-items',
  config: {
    schema: {
      props: z => z.object({}).default({}),
    },
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      filter: isFairwindsInsightsAvailable,
      loader: async () =>
        import('../components/ActionItemsCard/ActionItemsCard').then(m => (
          <m.ActionItemsCard {...config.props} />
        )),
    });
  },
});

/**
 * @alpha
 */
export const entityActionItemsTopCard = EntityCardBlueprint.makeWithOverrides({
  name: 'action-items-top',
  config: {
    schema: {
      props: z => z.object({}).default({}),
    },
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      filter: isFairwindsInsightsAvailable,
      loader: async () =>
        import('../components/ActionItemsTopCard/ActionItemsTopCard').then(
          m => <m.ActionItemsTopCard {...config.props} />,
        ),
    });
  },
});

/**
 * @alpha
 */
export const entityMTDCostOverviewCard = EntityCardBlueprint.makeWithOverrides({
  name: 'mtd-cost-overview',
  config: {
    schema: {
      props: z => z.object({}).default({}),
    },
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      filter: isFairwindsInsightsAvailable,
      loader: async () =>
        import('../components/MTDCostOverviewCard/MTDCostOverviewCard').then(
          m => <m.MTDCostOverviewCard {...config.props} />,
        ),
    });
  },
});

/**
 * @alpha
 */
export const entityVulnerabilitiesCard = EntityCardBlueprint.makeWithOverrides({
  name: 'vulnerabilities',
  config: {
    schema: {
      props: z => z.object({}).default({}),
    },
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      filter: isFairwindsInsightsAvailable,
      loader: async () =>
        import('../components/VulnerabilitiesCard/VulnerabilitiesCard').then(
          m => <m.VulnerabilitiesCard {...config.props} />,
        ),
    });
  },
});

/**
 * @alpha
 */
export const entityResourcesHistoryPodCountCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'resources-history-pod-count',
    config: {
      schema: {
        props: z => z.object({}).default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: isFairwindsInsightsAvailable,
        loader: async () =>
          import(
            '../components/ResourcesHistoryPodCountCard/ResourcesHistoryPodCountCard'
          ).then(m => <m.ResourcesHistoryPodCountCard {...config.props} />),
      });
    },
  });

/**
 * @alpha
 */
export const entityResourcesHistoryCPUCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'resources-history-cpu',
    config: {
      schema: {
        props: z => z.object({}).default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: isFairwindsInsightsAvailable,
        loader: async () =>
          import(
            '../components/ResourcesHistoryCPUCard/ResourcesHistoryCPUCard'
          ).then(m => <m.ResourcesHistoryCPUCard {...config.props} />),
      });
    },
  });

/**
 * @alpha
 */
export const entityResourcesHistoryMemoryCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'resources-history-memory',
    config: {
      schema: {
        props: z => z.object({}).default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: isFairwindsInsightsAvailable,
        loader: async () =>
          import(
            '../components/ResourcesHistoryMemoryCard/ResourcesHistoryMemoryCard'
          ).then(m => <m.ResourcesHistoryMemoryCard {...config.props} />),
      });
    },
  });
