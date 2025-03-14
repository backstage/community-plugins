/*
 * Copyright 2024 The Backstage Authors
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
import { rest } from 'msw';

const LOCAL_ADDR = 'https://example.com';

export const handlers = [
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          items: [
            require(`${__dirname}/cluster.open-cluster-management.io/managedclusters/local-cluster.json`),
            require(`${__dirname}/cluster.open-cluster-management.io/managedclusters/cluster1.json`),
            require(`${__dirname}/cluster.open-cluster-management.io/managedclusters/offline-cluster.json`),
          ],
        }),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/internal.open-cluster-management.io/v1beta1/managedclusterinfos`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          items: [
            require(`${__dirname}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`),
            require(`${__dirname}/internal.open-cluster-management.io/managedclusterinfos/cluster1.json`),
            require(`${__dirname}/internal.open-cluster-management.io/managedclusterinfos/offline-cluster.json`),
          ],
        }),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters/local-cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/cluster.open-cluster-management.io/managedclusters/local-cluster.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters/cluster1`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/cluster.open-cluster-management.io/managedclusters/cluster1.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters/offline-cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/cluster.open-cluster-management.io/managedclusters/offline-cluster.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters/non_existent_cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json(
          require(`${__dirname}/cluster.open-cluster-management.io/managedclusters/non_existent_cluster.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/internal.open-cluster-management.io/v1beta1/namespaces/cluster1/managedclusterinfos/cluster1`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/internal.open-cluster-management.io/managedclusterinfos/cluster1.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/internal.open-cluster-management.io/v1beta1/namespaces/local-cluster/managedclusterinfos/local-cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/internal.open-cluster-management.io/v1beta1/namespaces/offline-cluster/managedclusterinfos/offline-cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(`${__dirname}/internal.open-cluster-management.io/managedclusterinfos/offline-cluster.json`),
        ),
      );
    },
  ),
];
