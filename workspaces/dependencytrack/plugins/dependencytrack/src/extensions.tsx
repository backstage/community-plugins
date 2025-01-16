/*
 * Copyright 2025 The Backstage Authors
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
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { dependencytrackPlugin } from './plugin';
import { rootRouteRef } from './routes';
import {
  createComponentExtension,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { Options } from '@material-table/core';

type DependencytrackPageProps = {
  tableOptions?: Options<never>;
};

export const EntityDependencytrackSummaryCard = dependencytrackPlugin.provide(
  createComponentExtension({
    name: 'EntityDependencytrackSummaryCard',
    component: {
      lazy: () =>
        import('./components/DependencytrackCard').then(
          ({ DependencytrackSummaryCard }) => {
            const Dependencytrack = ({
              tableOptions,
            }: DependencytrackPageProps) => {
              const { entity } = useEntity();
              return (
                <DependencytrackSummaryCard
                  entity={entity}
                  tableOptions={
                    tableOptions || {
                      padding: 'dense',
                      paging: true,
                      search: false,
                      pageSize: 10,
                    }
                  }
                />
              );
            };
            return Dependencytrack;
          },
        ),
    },
  }),
);

export const EntityDependencytrackFindingCard = dependencytrackPlugin.provide(
  createComponentExtension({
    name: 'EntityDependencytrackFindingCard',
    component: {
      lazy: () =>
        import('./components/DependencytrackCard').then(
          ({ DependencytrackFindingCard }) => {
            const Dependencytrack = ({
              tableOptions,
            }: DependencytrackPageProps) => {
              const { entity } = useEntity();
              return (
                <DependencytrackFindingCard
                  entity={entity}
                  tableOptions={
                    tableOptions || {
                      padding: 'dense',
                      paging: true,
                      search: false,
                      pageSize: 10,
                    }
                  }
                />
              );
            };
            return Dependencytrack;
          },
        ),
    },
  }),
);

export const EntityDependencytrackContent = dependencytrackPlugin.provide(
  createRoutableExtension({
    name: 'EntityDependencytrackContent',
    mountPoint: rootRouteRef,
    component: () =>
      import('./components/DependencytrackCard').then(
        ({ DependencytrackFindingCard }) => {
          const DependencytrackPage = (props: DependencytrackPageProps) => {
            const { entity } = useEntity();
            const defaultOptions: Options<never> = {
              padding: 'dense',
              paging: true,
              search: false,
              pageSize: 5,
            };
            return (
              <DependencytrackFindingCard
                entity={entity}
                tableOptions={{ ...defaultOptions, ...props.tableOptions }}
              />
            );
          };
          return DependencytrackPage;
        },
      ),
  }),
);
