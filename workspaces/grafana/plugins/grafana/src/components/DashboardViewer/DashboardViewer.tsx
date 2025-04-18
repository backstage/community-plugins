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

import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD,
  isOverviewDashboardAvailable,
  overviewDashboardFromEntity,
} from '../../constants';

/**
 * Component which embeds the defined URL contents
 * @public
 */
export const DashboardViewer = ({ embedUrl }: { embedUrl: string }) => {
  return (
    <iframe
      title={embedUrl}
      src={embedUrl}
      width="100%"
      height="100%"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
};

/**
 * Component which embeds the dashboard overview for an entity
 * @public
 */
export const EntityDashboardViewer = () => {
  const { entity } = useEntity();

  if (!isOverviewDashboardAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState
        annotation={GRAFANA_ANNOTATION_OVERVIEW_DASHBOARD}
      />
    );
  }

  return <DashboardViewer embedUrl={overviewDashboardFromEntity(entity)} />;
};
