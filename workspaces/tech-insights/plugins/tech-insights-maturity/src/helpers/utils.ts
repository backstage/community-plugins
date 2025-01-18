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
import {
  Entity,
  RELATION_HAS_PART,
  RELATION_OWNER_OF,
  RELATION_PARENT_OF,
} from '@backstage/catalog-model';
import { humanizeEntityRef } from '@backstage/plugin-catalog-react';
import { Rank } from '@backstage-community/plugin-tech-insights-maturity-common';

export const entityTitleCompare = (a: Entity, b: Entity) => {
  const toRef = (entity: Entity) =>
    entity.metadata.title ??
    humanizeEntityRef(entity, {
      defaultKind: 'Component',
    });

  return toRef(a).localeCompare(toRef(b));
};

export const getSubEntityFilter = (entity: Entity): { type: string } => {
  let type = RELATION_HAS_PART;
  if (entity.kind === 'Group') {
    type =
      entity.relations?.find(x =>
        [RELATION_PARENT_OF, RELATION_OWNER_OF].includes(x.type),
      )?.type ?? RELATION_OWNER_OF;
  }
  return { type };
};

export const getRankColor = (rank: Rank) => {
  switch (rank) {
    case Rank.Stone:
      return '#70797D';
    case Rank.Bronze:
      return '#704A07';
    case Rank.Silver:
      return '#C4C4C4';
    case Rank.Gold:
      return '#DEB82D';
    default:
      return '#70797E';
  }
};

export const getNextRankColor = (rank: Rank, maxRank: Rank) => {
  if (maxRank === rank) {
    return 'limegreen';
  }
  return getRankColor(rank + 1);
};

export const pluralize = (count: number) => {
  if (count === 1) {
    return '';
  }
  return 's';
};
