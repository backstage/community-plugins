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

import { useMemo } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { ScorecardInfo } from '../ScorecardsInfo';
import { techInsightsApiRef } from '@backstage-community/plugin-tech-insights-react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getCompoundEntityRef } from '@backstage/catalog-model';
import { Check } from '@backstage-community/plugin-tech-insights-common';
import { ScorecardsGauge } from '../ScorecardsGauge';

export const ScorecardsCard = (props: {
  title: string;
  description?: string;
  checksId?: string[];
  filter?: (check: Check) => boolean;
  onlyFailed?: boolean;
  expanded?: boolean;
  gauge?: boolean;
}) => {
  const {
    title,
    description,
    checksId,
    filter,
    onlyFailed,
    gauge,
    expanded = !gauge,
  } = props;
  const api = useApi(techInsightsApiRef);
  const { entity } = useEntity();
  const { value, loading, error } = useAsync(
    async () => await api.runChecks(getCompoundEntityRef(entity), checksId),
    [api, entity, JSON.stringify(checksId)],
  );

  const filteredValues =
    !filter || !value ? value : value.filter(val => filter(val.check));

  const checkResultRenderers = useMemo(() => {
    if (!onlyFailed || !filteredValues) return {};

    const types = [...new Set(filteredValues.map(({ check }) => check.type))];
    const renderers = api.getCheckResultRenderers(types);
    return Object.fromEntries(
      renderers.map(renderer => [renderer.type, renderer]),
    );
  }, [api, filteredValues, onlyFailed]);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ErrorPanel error={error} />;
  }

  const filteredValue = !onlyFailed
    ? filteredValues || []
    : (filteredValues || []).filter(val =>
        checkResultRenderers[val.check.type]?.isFailed?.(val),
      );

  return gauge ? (
    <ScorecardsGauge
      title={title}
      description={description}
      entity={entity}
      checkResults={filteredValue}
      noWarning={onlyFailed}
      expanded={expanded}
    />
  ) : (
    <ScorecardInfo
      title={title}
      description={description}
      entity={entity}
      checkResults={filteredValue}
      noWarning={onlyFailed}
      expanded={expanded}
    />
  );
};
