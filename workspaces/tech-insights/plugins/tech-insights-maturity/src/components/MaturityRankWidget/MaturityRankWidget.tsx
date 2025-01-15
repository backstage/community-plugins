/*
 * Copyright 2025 The Backstage Authors
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
import React from 'react';
import { MaturityRankAvatar } from '../MaturityRankAvatar';
import { useScoringRankLoader } from '../../hooks/useScoringRankLoader';

type Props = {
  entity: Entity;
  size?: number;
  chip?: boolean;
};

export const MaturityRankWidget = ({ entity, size, chip }: Props) => {
  const { value, loading } = useScoringRankLoader(entity);
  if (loading || !value) return <></>;
  return (
    <MaturityRankAvatar
      entity={entity}
      value={value}
      size={size}
      variant={chip ? 'chip' : undefined}
    />
  );
};
