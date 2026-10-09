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

import type { Key } from 'react';
import { Check } from '@backstage-community/plugin-tech-insights-common';
import { Alert, Flex, Select } from '@backstage/ui';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';

const yesNoOptions = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
];

/** public **/
export type FiltersProps = {
  checksChanged: (checks: Check[]) => void;
  withResultsChanged: (withResults: boolean) => void;
  hasFailedChecksChanged: (hasFailedChecks: boolean) => void;
};

export const Filters = (props: FiltersProps) => {
  const { checksChanged, withResultsChanged, hasFailedChecksChanged } = props;
  const api = useApi(techInsightsApiRef);

  const { value, loading, error } = useAsync(async () => {
    return api.getAllChecks();
  }, [api]);

  if (error) {
    return <Alert status="danger" title={error.message} />;
  }

  const checks = value ?? [];

  const handleChecksChange = (keys: Key[] | Key | null) => {
    const selected = new Set(Array.isArray(keys) ? keys : []);
    checksChanged(checks.filter(check => selected.has(check.id)));
  };

  return (
    <Flex direction="column" gap="4" py="2">
      <Select
        label="Checks"
        selectionMode="multiple"
        searchable
        isDisabled={loading}
        options={checks.map(check => ({
          id: check.id,
          label: check.name,
          description: check.id,
        }))}
        onChange={handleChecksChange}
      />
      <Select
        label="Only with results"
        options={yesNoOptions}
        defaultValue="yes"
        onChange={key => key && withResultsChanged(key === 'yes')}
      />
      <Select
        label="Has failed checks"
        options={yesNoOptions}
        defaultValue="no"
        onChange={key => key && hasFailedChecksChanged(key === 'yes')}
      />
    </Flex>
  );
};
