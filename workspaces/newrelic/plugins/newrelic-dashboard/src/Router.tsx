/*
 * Copyright 2021 The Backstage Authors
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
import { NewRelicDashboard } from './components/NewRelicDashboard';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import { NEWRELIC_GUID_ANNOTATION } from './constants';

/** @public */
export const isNewRelicDashboardAvailable = (entity: Entity) =>
  Boolean(entity?.metadata?.annotations?.[NEWRELIC_GUID_ANNOTATION]);

export const Router = () => {
  const { entity } = useEntity();

  if (isNewRelicDashboardAvailable(entity)) {
    return <NewRelicDashboard />;
  }

  return (
    <>
      <MissingAnnotationEmptyState annotation={NEWRELIC_GUID_ANNOTATION} />
      <a
        href="https://github.com/backstage/backstage/tree/master/plugins/newrelic-dashboard"
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: 'var(--bui-fg-primary)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: 'var(--bui-radius-1)',
          fontWeight: 500,
          marginTop: 'var(--bui-space-3)',
        }}
      >
        Read New Relic Dashboard Plugin Docs
      </a>
    </>
  );
};
