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
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import type { Entity } from '@backstage/catalog-model';
import { EntityMdxCard, mdxCardPlugin } from '../src/legacy';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-service',
    namespace: 'default',
    annotations: { 'backstage.io/techdocs-ref': 'dir:.' },
  },
  spec: { type: 'service', owner: 'team-a', lifecycle: 'production' },
};

const template = `
## {props.entity.metadata.name}

Owned by <EntityRefLink entityRef={\`group:default/\${props.entity.spec.owner}\`} />.

<BarChart
  data={[
    { month: 'Jan', deploys: 10 },
    { month: 'Feb', deploys: 15 },
    { month: 'Mar', deploys: 20 },
  ]}
  xKey="month"
  yKeys={['deploys']}
/>
`;

createDevApp()
  .registerPlugin(mdxCardPlugin)
  .addPage({
    title: 'Entity MDX Card',
    path: '/mdx-card',
    element: (
      <EntityProvider entity={entity}>
        <EntityMdxCard title="Example" template={template} />
      </EntityProvider>
    ),
  })
  .render();
