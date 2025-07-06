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
import { Chip, Tooltip } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { default as React } from 'react';
import { KialiIcon } from '../../config/KialiIcon';
import { infoStyle } from '../../pages/Overview/OverviewCard/OverviewCardControlPlaneNamespace';
import { getChipStyle, kialiStyle } from '../../styles/StyleUtils';

type Props = {
  version?: string;
};

const lockIconStyle = kialiStyle({ marginLeft: '5px' });

const LockIcon = (): React.ReactElement => {
  return <KialiIcon.MtlsLock className={lockIconStyle} />;
};

export const TLSInfo = (props: Props) => {
  const theme = useTheme();
  const chipStyle = getChipStyle(theme);

  return (
    <div style={{ textAlign: 'left' }}>
      <div>
        <div
          style={{
            display: 'inline-block',
            width: '125px',
            whiteSpace: 'nowrap',
          }}
        >
          Min TLS version
        </div>

        <Chip
          size="small"
          style={chipStyle}
          data-test="label-TLS"
          label={
            <div style={{ display: '-webkit-box' }}>
              {props.version} <LockIcon />
              <Tooltip
                placement="right"
                title={
                  <div style={{ textAlign: 'left' }}>
                    The meshConfig.meshMTLS.minProtocolVersion field specifies
                    the minimum TLS version for the TLS connections among Istio
                    workloads. N/A if it was not set.
                  </div>
                }
              >
                <span>
                  <KialiIcon.Info className={infoStyle} />
                </span>
              </Tooltip>
            </div>
          }
        />
      </div>
    </div>
  );
};
