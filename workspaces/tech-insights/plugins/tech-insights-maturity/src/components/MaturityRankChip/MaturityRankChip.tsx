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
import { Rank } from '@backstage-community/plugin-tech-insights-maturity-common';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { MaturityLink } from '../../helpers/MaturityLink';
import getRankImg from '../../helpers/Rank';

type Props = {
  value: { rank: Rank; isMaxRank: boolean };
  className?: string;
  size?: number;
  entity?: Entity;
};

export const MaturityRankChip = ({ className, entity, value }: Props) => {
  const rank = value.rank;
  const tooltip = value.isMaxRank
    ? 'All required tasks have been completed!'
    : `Increase your rank by completing all ${Rank[rank]} rank tasks!`;

  const result = (
    <Tooltip title={tooltip} arrow>
      <Chip
        avatar={
          <Avatar
            alt={Rank[rank]}
            src={getRankImg(rank)}
            className={className}
            style={{ width: 27, height: 27 }}
          />
        }
        label={Rank[rank]}
        color={value.isMaxRank ? 'success' : 'default'}
        clickable={entity !== undefined}
      />
    </Tooltip>
  );

  // Wrap with Entity link if Entity is provided
  if (entity !== undefined) {
    return <MaturityLink entity={entity}>{result}</MaturityLink>;
  }

  return result;
};
