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
import { getChipStyle, kialiStyle } from '../../styles/StyleUtils';

type Props = {
  version?: string;
};

const lockIconStyle = kialiStyle({ marginLeft: '5px' });
const infoIconStyle = kialiStyle({ margin: '0px 0px -1px 4px' });

const LockIcon = (): React.ReactElement => {
  return <KialiIcon.MtlsLock className={lockIconStyle} />;
};

export const TLSInfo = (props: Props) => {
  const theme = useTheme();
  const chipStyle = getChipStyle(theme);

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            width: '125px',
            whiteSpace: 'nowrap',
            gap: 4,
            flexWrap: 'nowrap',
          }}
        >
          Min TLS version
          <Tooltip
            placement="right"
            title={
              <div style={{ textAlign: 'left' }}>
                The meshConfig.meshMTLS.minProtocolVersion field specifies the
                minimum TLS version for the TLS connections among Istio
                workloads. N/A if it was not set.
              </div>
            }
          >
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <KialiIcon.Info className={infoIconStyle} />
            </span>
          </Tooltip>
        </div>

        <Chip
          size="small"
          style={chipStyle}
          data-test="label-TLS"
          label={
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <span>{props.version}</span>
              <LockIcon />
            </span>
          }
        />
      </div>
    </div>
  );
};
