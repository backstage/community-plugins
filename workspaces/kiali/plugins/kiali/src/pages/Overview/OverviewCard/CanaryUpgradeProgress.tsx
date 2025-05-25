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
import {
  ChartDonutUtilization,
  ChartLabel,
  ChartThemeColor,
} from '@patternfly/react-charts';
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
          <ChartDonutUtilization
            ariaDesc="Canary upgrade status"
            ariaTitle="Canary upgrade status"
            constrainToVisibleArea
            data={{ x: 'Migrated namespaces', y: migrated }}
            labels={({ datum }) =>
              datum.x ? `${datum.x}: ${datum.y.toFixed(2)}%` : null
            }
            invert
            title={`${migrated.toFixed(2)}%`}
            height={170}
            themeColor={ChartThemeColor.green}
            titleComponent={
              <ChartLabel
                style={{
                  fill: theme === 'dark' ? '#fff' : '#151515',
                  fontSize: 24,
                }}
              />
            }
          />
        </div>
        <div>
          <p>{`${props.canaryUpgradeStatus.migratedNamespaces.length} of ${total} namespaces migrated`}</p>
        </div>
      </div>
    </div>
  );
};
