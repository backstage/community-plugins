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
import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  EntityRefLink,
  useEntity,
  useRelatedEntities,
} from '@backstage/plugin-catalog-react';
import {
  CheckmarxEntitySummary,
  isCheckmarxAvailable,
} from '@backstage-community/plugin-checkmarx-react';
import { checkmarxApiRef } from '../apiRef';
import Link from '@material-ui/core/Link';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import useAsync from 'react-use/esm/useAsync';

type RelatedEntityRow = {
  entity: Entity;
  enabled: boolean;
  summary?: CheckmarxEntitySummary;
};

const formatTimestamp = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '-';

const columns: TableColumn<RelatedEntityRow>[] = [
  {
    title: 'Entity',
    render: row => <EntityRefLink entityRef={stringifyEntityRef(row.entity)} />,
  },
  {
    title: 'Branch',
    field: 'summary.branch',
    render: row => row.summary?.branch ?? '-',
  },
  {
    title: 'SAST',
    field: 'summary.metrics.sastFindings',
    render: row => row.summary?.metrics.sastFindings ?? '-',
  },
  {
    title: 'Critical / High',
    field: 'summary.metrics.criticalHighFindings',
    render: row => row.summary?.metrics.criticalHighFindings ?? '-',
  },
  {
    title: 'SCA Packages',
    field: 'summary.metrics.scaPackages',
    render: row => row.summary?.metrics.scaPackages ?? '-',
  },
  {
    title: 'Outdated',
    field: 'summary.metrics.outdatedPackages',
    render: row => row.summary?.metrics.outdatedPackages ?? '-',
  },
  {
    title: 'Updated',
    field: 'summary.lastUpdated',
    render: row => formatTimestamp(row.summary?.lastUpdated),
  },
  {
    title: 'Status',
    render: row => {
      if (!row.enabled) {
        return 'Not enabled';
      }

      return row.summary ? 'Available' : 'No completed scan';
    },
  },
  {
    title: 'View',
    render: row =>
      row.summary?.scanUrl ? (
        <Link
          href={row.summary.scanUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View more <OpenInNewIcon fontSize="inherit" />
        </Link>
      ) : (
        '-'
      ),
  },
];

/** @public */
export type CheckmarxRelatedEntitiesOverviewProps = {
  relationType: string;
  entityKind: string;
};

/** @public */
export const CheckmarxRelatedEntitiesOverview = (
  props: CheckmarxRelatedEntitiesOverviewProps,
) => {
  const api = useApi(checkmarxApiRef);
  const { entity: parentEntity } = useEntity();
  const {
    entities,
    loading: loadingEntities,
    error: entityError,
  } = useRelatedEntities(parentEntity, {
    type: props.relationType,
    kind: props.entityKind,
  });

  const enabledEntities = (entities ?? []).filter(isCheckmarxAvailable);

  const {
    value: summaries,
    loading: loadingSummaries,
    error: summaryError,
  } = useAsync(
    async () => api.getEntitySummaries(enabledEntities),
    [api, enabledEntities],
  );

  if (loadingEntities || loadingSummaries) {
    return <Progress />;
  }

  const error = entityError ?? summaryError;
  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const summaryMap = new Map<string, CheckmarxEntitySummary | undefined>();
  enabledEntities.forEach((relatedEntity, index) => {
    summaryMap.set(stringifyEntityRef(relatedEntity), summaries?.[index]);
  });

  const rows: RelatedEntityRow[] = (entities ?? []).map(relatedEntity => ({
    entity: relatedEntity,
    enabled: isCheckmarxAvailable(relatedEntity),
    summary: summaryMap.get(stringifyEntityRef(relatedEntity)),
  }));

  return (
    <Table
      title={`Checkmarx (${rows.length})`}
      columns={columns}
      data={rows}
      options={{
        paging: rows.length > 20,
        pageSize: 20,
        padding: 'dense',
        pageSizeOptions: [10, 20, 50, 100],
      }}
    />
  );
};
