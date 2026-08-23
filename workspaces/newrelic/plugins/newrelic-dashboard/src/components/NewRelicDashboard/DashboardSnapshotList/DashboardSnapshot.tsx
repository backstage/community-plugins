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

import { useApi, storageApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import {
  InfoCard,
  Progress,
  ErrorPanel,
  Link,
} from '@backstage/core-components';
import { newRelicDashboardApiRef } from '../../../api';
import { DashboardSnapshotSummary } from '../../../api/NewRelicDashboardApi';
import useObservable from 'react-use/esm/useObservable';
import styles from './DashboardSnapshot.module.css';

/**
 * @public
 */
export const DashboardSnapshot = (props: {
  guid: string;
  name: string;
  permalink: string;
}) => {
  const { guid, name, permalink } = props;
  const newRelicDashboardAPI = useApi(newRelicDashboardApiRef);
  const storageApi = useApi(storageApiRef).forBucket('newrelic-dashboard');
  const setStorageValue = (value: number) => {
    storageApi.set(guid, value);
  };
  const storageSnapshot = useObservable(
    storageApi.observe$<number>(guid),
    storageApi.snapshot(guid),
  );

  const { value, loading, error } = useAsync(async (): Promise<
    DashboardSnapshotSummary | undefined
  > => {
    const dashboardObject: Promise<DashboardSnapshotSummary | undefined> =
      newRelicDashboardAPI.getDashboardSnapshot(
        guid,
        storageSnapshot.value || 2592000000,
      );
    return dashboardObject;
  }, [guid, storageSnapshot.value]);

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel title={error.name} defaultExpanded error={error} />;
  }

  const url = value?.getDashboardSnapshot?.data?.dashboardCreateSnapshotUrl;

  return (
    <InfoCard
      variant="gridItem"
      title={name}
      action={
        // eslint-disable-next-line react/forbid-elements
        <select
          className={styles.cardSelect}
          defaultValue={2592000000}
          value={storageSnapshot.value}
          onChange={event => {
            setStorageValue(Number(event.target.value));
          }}
        >
          <option value={3600000}>1 Hour</option>
          <option value={43200000}>12 Hours</option>
          <option value={86400000}>1 Day</option>
          <option value={259200000}>3 Days</option>
          <option value={604800000}>1 Week</option>
          <option value={2592000000}>1 Month</option>
        </select>
      }
    >
      <div className={styles.dashboardWrapper}>
        <div className={styles.dashboardContent}>
          <Link to={permalink}>
            {url ? (
              <img
                alt={`${name} Dashboard`}
                className={styles.dashboardImg}
                src={url}
              />
            ) : (
              'Dashboard loading... , click here to open if it did not render correctly'
            )}
          </Link>
        </div>
      </div>
    </InfoCard>
  );
};
