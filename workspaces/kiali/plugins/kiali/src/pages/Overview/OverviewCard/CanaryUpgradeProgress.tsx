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
import { CanaryUpgradeStatus } from '@backstage-community/plugin-kiali-common/types';
import { Tooltip, useTheme } from '@material-ui/core';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { PieChart } from '@mui/x-charts/PieChart';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { KialiIcon } from '../../../config/KialiIcon';
import { kialiStyle } from '../../../styles/StyleUtils';

type Props = {
  canaryUpgradeStatus: CanaryUpgradeStatus;
};

export const infoStyle = kialiStyle({
  margin: '0px 0px -1px 4px',
});

export const CanaryUpgradeProgress = (props: Props) => {
  const total =
    props.canaryUpgradeStatus.migratedNamespaces.length +
    props.canaryUpgradeStatus.pendingNamespaces.length;
  const migrated =
    total > 0
      ? (props.canaryUpgradeStatus.migratedNamespaces.length * 100) / total
      : 0;
  const theme = useTheme().palette.type;

  const size = { width: 220, height: 170 };
  const pending = Math.max(0, 100 - migrated);

  const StyledText = styled('text')(({ theme: muiTheme }) => ({
    fill: muiTheme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 24,
  }));

  function PieCenterLabel({ children }: { children: ReactNode }) {
    const { width, height, left, top } = useDrawingArea();
    return (
      <StyledText x={left + width / 2} y={top + height / 2}>
        {children}
      </StyledText>
    );
  }

  return (
    <div
      style={{ textAlign: 'center', paddingTop: '10px' }}
      data-test="canary-upgrade"
    >
      <div>
        <div>
          Canary upgrade status
          <Tooltip
            placement="right"
            title={`There is an in progress canary upgrade from version "${props.canaryUpgradeStatus.currentVersion}" to version "${props.canaryUpgradeStatus.upgradeVersion}"`}
          >
            <span>
              <KialiIcon.Info className={infoStyle} />
            </span>
          </Tooltip>
        </div>
        <div style={{ height: 180 }}>
          <PieChart
            aria-label="Canary upgrade status"
            series={[
              {
                data: [
                  { value: migrated, label: 'Migrated namespaces' },
                  { value: pending, label: 'Pending namespaces' },
                ],
                innerRadius: 60,
              },
            ]}
            colors={
              theme === 'dark' ? ['#3E8635', '#8A8D90'] : ['#3E8635', '#D2D2D2']
            }
            {...size}
          >
            <PieCenterLabel>{`${migrated.toFixed(2)}%`}</PieCenterLabel>
          </PieChart>
        </div>
        <div>
          <p>{`${props.canaryUpgradeStatus.migratedNamespaces.length} of ${total} namespaces migrated`}</p>
        </div>
      </div>
    </div>
  );
};
