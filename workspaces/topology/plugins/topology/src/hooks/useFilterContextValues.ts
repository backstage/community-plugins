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
import { useState, useMemo } from 'react';

import { SHOW_POD_COUNT_FILTER_ID } from '../const';
import { DisplayFilters, FilterContextType } from '../types/types';
import { useTranslation } from './useTranslation';

export const useFilterContextValues = (): FilterContextType => {
  const { t } = useTranslation();

  const topologyFilters = useMemo(
    () => [
      {
        value: SHOW_POD_COUNT_FILTER_ID,
        content: t('filters.showPodCount'),
        isSelected: false,
        isDisabled: false,
      },
    ],
    [t],
  );

  const [filters, setFilters] = useState<DisplayFilters>(topologyFilters);

  return { filters, setAppliedTopologyFilters: setFilters };
};
