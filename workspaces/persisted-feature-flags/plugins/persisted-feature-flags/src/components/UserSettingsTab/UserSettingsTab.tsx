/*
 * Copyright 2020 The Backstage Authors
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

import { useRef, useCallback, useState } from 'react';
import List from '@material-ui/core/List';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { EmptyFlags } from './EmptyFlags';
import { FlagItem } from './FeatureFlagsItem';
import {
  featureFlagsApiRef,
  FeatureFlagState,
  useApi,
} from '@backstage/core-plugin-api';
import { InfoCard, Progress } from '@backstage/core-components';
import ClearIcon from '@material-ui/icons/Clear';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { userSettingsTranslationRef } from '@backstage/plugin-user-settings/alpha';

import { persistedFeatureFlagsApiRef } from '@backstage-community/plugin-persisted-feature-flags-react';

import { AnyFeatureFlag } from './types';
import { GetPersistentFlags } from './GetPersistentFlags';

/** @public */
export const UserSettingsFeatureFlags = () => {
  const persistedFeatureFlagsApi = useApi(persistedFeatureFlagsApiRef);

  const [persistedEnabledFlags, setPersistedEnabledFlags] = useState<
    string[] | undefined
  >(undefined);

  const flags = persistedFeatureFlagsApi
    .getPersistedFlags()
    .map(flag => flag.name);

  if (!persistedEnabledFlags) {
    return (
      <>
        <GetPersistentFlags flags={flags} onResult={setPersistedEnabledFlags} />
        <Progress />
      </>
    );
  }

  return (
    <UserSettingsFeatureFlagsInner
      persistedEnabledFlags={persistedEnabledFlags}
    />
  );
};

const alphaNumSortFlags = (flags: AnyFeatureFlag[]): AnyFeatureFlag[] => {
  return flags.sort((a, b) => a.name.localeCompare(b.name));
};

const sortFlags = (
  flags: AnyFeatureFlag[],
  enabled: string[],
): AnyFeatureFlag[] => {
  const activeFlags = flags.filter(flag => enabled.includes(flag.name));
  const idleFlags = flags.filter(flag => !enabled.includes(flag.name));
  return [...alphaNumSortFlags(activeFlags), ...alphaNumSortFlags(idleFlags)];
};

function UserSettingsFeatureFlagsInner(props: {
  persistedEnabledFlags: string[];
}) {
  const { persistedEnabledFlags } = props;

  const featureFlagsApi = useApi(featureFlagsApiRef);
  const persistedFeatureFlagsApi = useApi(persistedFeatureFlagsApiRef);
  const inputRef = useRef<HTMLElement>();

  const initialFeatureFlags = featureFlagsApi.getRegisteredFlags();
  const persistedFeatureFlags = persistedFeatureFlagsApi.getPersistedFlags();

  const allInitiallyEnabledFlags = [
    ...initialFeatureFlags
      .filter(flag => featureFlagsApi.isActive(flag.name))
      .map(flag => flag.name),
    ...persistedEnabledFlags,
  ];

  const initialFeatureFlagsSorted = sortFlags(
    [
      ...initialFeatureFlags.map(
        (flag): AnyFeatureFlag => ({ persisted: false, ...flag }),
      ),
      ...persistedFeatureFlags.map(
        (flag): AnyFeatureFlag => ({ persisted: true, ...flag }),
      ),
    ],
    allInitiallyEnabledFlags,
  );

  const [featureFlags] = useState(initialFeatureFlagsSorted);

  const initialFlagState = Object.fromEntries(
    featureFlags.map(({ name }) => [name, featureFlagsApi.isActive(name)]),
  );

  const [state, setState] = useState<Record<string, boolean>>(initialFlagState);
  const [filterInput, setFilterInput] = useState<string>('');
  const { t } = useTranslationRef(userSettingsTranslationRef);

  const toggleFlag = useCallback(
    (flagName: string) => {
      const newState = featureFlagsApi.isActive(flagName)
        ? FeatureFlagState.None
        : FeatureFlagState.Active;

      featureFlagsApi.save({
        states: { [flagName]: newState },
        merge: true,
      });

      setState(prevState => ({
        ...prevState,
        [flagName]: newState === FeatureFlagState.Active,
      }));
    },
    [featureFlagsApi],
  );

  if (!featureFlags.length) {
    return <EmptyFlags />;
  }

  const clearFilterInput = () => {
    setFilterInput('');
    inputRef?.current?.focus();
  };

  const filteredFeatureFlags = featureFlags.filter(featureFlag => {
    const featureFlagName = featureFlag.name.toLocaleLowerCase('en-US');
    return featureFlagName.includes(filterInput.toLocaleLowerCase('en-US'));
  });

  const Header = () => (
    <Grid container style={{ justifyContent: 'space-between' }}>
      <Grid item xs={6} md={8}>
        <Typography variant="h5">{t('featureFlags.title')}</Typography>
        <Typography variant="subtitle1">
          {t('featureFlags.description')}
        </Typography>
      </Grid>
      {featureFlags.length >= 10 && (
        <Grid item xs={6} md={4}>
          <TextField
            label={t('featureFlags.filterTitle')}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
            inputRef={ref => ref && ref.focus()}
            InputProps={{
              ...(filterInput.length && {
                endAdornment: (
                  <IconButton
                    aria-label={t('featureFlags.clearFilter')}
                    onClick={clearFilterInput}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                ),
              }),
            }}
            onChange={e => setFilterInput(e.target.value)}
            value={filterInput}
          />
        </Grid>
      )}
    </Grid>
  );

  return (
    <InfoCard title={<Header />}>
      <List dense>
        {filteredFeatureFlags.map(featureFlag => {
          const enabled = Boolean(state[featureFlag.name]);

          return (
            <FlagItem
              key={featureFlag.name}
              flag={featureFlag}
              enabled={enabled}
              initialEnabled={persistedEnabledFlags.includes(featureFlag.name)}
              toggleHandler={toggleFlag}
            />
          );
        })}
      </List>
    </InfoCard>
  );
}
