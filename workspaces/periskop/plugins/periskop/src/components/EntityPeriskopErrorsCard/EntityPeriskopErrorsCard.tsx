/*
 * Copyright 2022 The Backstage Authors
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

import type { ReactNode } from 'react';

import { useState } from 'react';
import { DateTime } from 'luxon';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
  StatusWarning,
  StatusError,
  StatusPending,
  EmptyState,
} from '@backstage/core-components';
import { Flex, Link, Select, Text } from '@backstage/ui';
import useAsync from 'react-use/esm/useAsync';
import { periskopApiRef } from '../../plugin';
import { AggregatedError, NotFoundInInstance } from '../../types';

/**
 * Constant storing Periskop project name.
 *
 * @public
 */
export const PERISKOP_NAME_ANNOTATION = 'periskop.io/service-name';

/**
 * Returns true if Periskop annotation is present in the given entity.
 *
 * @public
 */
export const isPeriskopAvailable = (entity: Entity): boolean =>
  Boolean(entity.metadata.annotations?.[PERISKOP_NAME_ANNOTATION]);

const renderKey = (error: AggregatedError, linkTarget: string): ReactNode => {
  return (
    <Link href={linkTarget} target="_blank" rel="noopener noreferrer">
      {error.aggregation_key}
    </Link>
  );
};

const renderSeverity = (severity: string): ReactNode => {
  if (severity.toLocaleLowerCase('en-US') === 'warning') {
    return <StatusWarning>{severity}</StatusWarning>;
  } else if (severity.toLocaleLowerCase('en-US') === 'error') {
    return <StatusError>{severity}</StatusError>;
  }
  return <StatusPending>{severity}</StatusPending>;
};

const renderLastOccurrence = (error: AggregatedError): ReactNode => {
  return DateTime.fromMillis(
    error.latest_errors[0].timestamp * 1000,
  ).toRelative();
};

function isNotFoundInInstance(
  apiResult: AggregatedError[] | NotFoundInInstance | undefined,
): apiResult is NotFoundInInstance {
  return (apiResult as NotFoundInInstance)?.body !== undefined;
}

export const EntityPeriskopErrorsCard = () => {
  const { entity } = useEntity();
  const entityPeriskopName: string =
    entity.metadata.annotations?.[PERISKOP_NAME_ANNOTATION] ??
    entity.metadata.name;

  const periskopApi = useApi(periskopApiRef);
  const instanceNames = periskopApi.getInstanceNames();
  const [instanceOption, setInstanceOption] = useState<string>(
    instanceNames[0],
  );
  const {
    value: aggregatedErrors,
    loading,
    error,
  } = useAsync(async (): Promise<AggregatedError[] | NotFoundInInstance> => {
    return periskopApi.getErrors(instanceOption, entityPeriskopName);
  }, [instanceOption]);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const columns: TableColumn<AggregatedError>[] = [
    {
      title: 'Key',
      field: 'aggregation_key',
      highlight: true,
      sorting: false,
      render: aggregatedError => {
        const errorUrl = periskopApi.getErrorInstanceUrl(
          instanceOption,
          entityPeriskopName,
          aggregatedError,
        );
        return renderKey(aggregatedError, errorUrl);
      },
    },
    { title: 'Occurrences', field: 'total_count', sorting: true },
    {
      title: 'Last Occurrence',
      render: aggregatedError => renderLastOccurrence(aggregatedError),
      defaultSort: 'asc',
      customSort: (a, b) =>
        b.latest_errors[0].timestamp - a.latest_errors[0].timestamp,
      type: 'datetime',
    },
    {
      title: 'Severity',
      field: 'severity',
      render: aggregatedError => renderSeverity(aggregatedError.severity),
      sorting: false,
    },
  ];

  const sortingSelect = (
    <Select
      value={instanceOption}
      label="Instance"
      options={instanceNames.map(e => ({
        label: e,
        value: e,
      }))}
      onChange={key => key !== null && setInstanceOption(key.toString())}
    />
  );

  const contentHeader = (
    <Flex justify="between" align="center" gap="4" mb="4">
      <Flex direction="column" gap="1">
        <Text as="h2" variant="title-medium">
          Periskop
        </Text>
        <Text as="p" variant="body-medium" color="secondary">
          {entityPeriskopName}
        </Text>
      </Flex>
      {sortingSelect}
    </Flex>
  );

  if (isNotFoundInInstance(aggregatedErrors)) {
    return (
      <>
        {contentHeader}
        <EmptyState
          title="Periskop returned an error"
          description={aggregatedErrors.body}
          missing="data"
        />
      </>
    );
  }

  return (
    <>
      {contentHeader}
      <Table
        options={{
          search: false,
          paging: false,
          filtering: true,
          padding: 'dense',
          toolbar: false,
        }}
        columns={columns}
        data={aggregatedErrors || []}
      />
    </>
  );
};
