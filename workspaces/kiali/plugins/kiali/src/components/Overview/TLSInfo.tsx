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
import * as React from 'react';
import { KialiIcon } from '../../config/KialiIcon';
import { infoStyle } from '../../pages/Overview/OverviewCard/OverviewCardControlPlaneNamespace';
import { getChipStyle, kialiStyle } from '../../styles/StyleUtils';
import { CertsInfo } from '../../types/CertsInfo';

type Props = {
  certificatesInformationIndicators: boolean;
  version?: string;
  certsInfo: CertsInfo[];
};

const lockIconStyle = kialiStyle({ marginLeft: '5px' });

function showCerts(certs: CertsInfo[]) {
  if (certs) {
    const rows = certs.map(item => (
      <div key="showCerts">
        <div
          style={{
            display: 'inline-block',
            width: '125px',
            whiteSpace: 'nowrap',
          }}
        >
          From {item.issuer}
        </div>
        <div>
          <div>Issuer: </div>
          <div>{item.secretName}</div>
        </div>
        <div>
          <div>Valid From: </div>
          <div>{item.notAfter}</div>
        </div>
        <div>
          <div>Valid To: </div>
          <div>{item.notBefore}</div>
        </div>
      </div>
    ));
    return <div>{rows}</div>;
  }
  return 'No cert info';
}

function LockIcon(props: Props) {
  return props.certificatesInformationIndicators === true ? (
    <Tooltip placement="top" title={showCerts(props.certsInfo)}>
      <span data-test="lockerCA">
        <KialiIcon.MtlsLock className={lockIconStyle} />
      </span>
    </Tooltip>
  ) : (
    <KialiIcon.MtlsLock className={lockIconStyle} />
  );
}

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
              {props.version}{' '}
              <LockIcon
                certificatesInformationIndicators={
                  props.certificatesInformationIndicators
                }
                certsInfo={props.certsInfo}
              />
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
