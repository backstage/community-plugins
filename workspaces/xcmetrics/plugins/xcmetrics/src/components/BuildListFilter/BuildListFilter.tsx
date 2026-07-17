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

import { useEffect, useState } from 'react';
import { ButtonIcon, Button } from '@backstage/ui';
import { RiFilter3Line } from '@remixicon/react';
import { InfoCard, Select } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { BuildFilters, BuildStatus, xcmetricsApiRef } from '../../api';
import { DatePicker } from '../DatePicker';
import styles from './BuildListFilter.module.css';

const toSelectItems = (strings: string[]) => {
  return strings.map(str => ({ label: str, value: str }));
};

type FilterOption<T> = T | 'all';

interface FiltersProps {
  initialValues: BuildFilters;
  onFilterChange: (filters: BuildFilters) => void;
}

export const BuildListFilter = ({
  onFilterChange,
  initialValues,
}: FiltersProps) => {
  const client = useApi(xcmetricsApiRef);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);

  useEffect(() => onFilterChange(values), [onFilterChange, values]);

  const numFilters = Object.keys(values).reduce((sum, key) => {
    const filtersKey = key as keyof BuildFilters;
    return sum + Number(values[filtersKey] !== initialValues[filtersKey]);
  }, 0);

  const title = (
    <>
      <ButtonIcon
        aria-label={`${open ? 'hide' : 'show'} filters`}
        icon={<RiFilter3Line size={18} />}
        variant="secondary"
        onPress={() => setOpen(!open)}
      />
      Filters ({numFilters})
      {!!numFilters && (
        <Button variant="secondary" onClick={() => setValues(initialValues)}>
          Clear all
        </Button>
      )}
    </>
  );

  const statusItems: { label: string; value: FilterOption<BuildStatus> }[] = [
    { label: 'All', value: 'all' },
    { label: 'Succeeded', value: 'succeeded' },
    { label: 'Failed', value: 'failed' },
    { label: 'Stopped', value: 'stopped' },
  ];

  const { value: projects, loading } = useAsync(async () => {
    return client.getProjects();
  }, []);

  const content = (
    <div className={styles.filtersContent}>
      <div className={styles.filterItem}>
        <DatePicker
          label="From"
          value={values.from}
          onDateChange={date => setValues({ ...values, from: date })}
        />
      </div>
      <div className={styles.filterItem}>
        <DatePicker
          label="To"
          value={values.to}
          onDateChange={date => setValues({ ...values, to: date })}
        />
      </div>
      <div className={styles.filterItem}>
        <Select
          label="Status"
          items={statusItems}
          selected={!values.buildStatus ? 'all' : values.buildStatus}
          onChange={selection => {
            const buildStatus =
              selection === 'all' ? undefined : (selection as BuildStatus);
            setValues({ ...values, buildStatus });
          }}
        />
      </div>
      <div className={styles.filterItem}>
        {loading ? (
          <Select
            label="Project"
            placeholder="Loading.."
            items={[]}
            onChange={() => undefined}
          />
        ) : (
          <Select
            label="Project"
            items={toSelectItems(['All'].concat(projects ?? []))}
            selected={values.project ? values.project : 'All'}
            onChange={selection =>
              setValues({
                ...values,
                project:
                  selection === 'All' ? undefined : (selection as string),
              })
            }
          />
        )}
      </div>
    </div>
  );

  return (
    <InfoCard
      title={title}
      titleTypographyProps={{ variant: 'h6' }}
      divider={open}
      noPadding
      variant="gridItem"
    >
      {open && content}
    </InfoCard>
  );
};
