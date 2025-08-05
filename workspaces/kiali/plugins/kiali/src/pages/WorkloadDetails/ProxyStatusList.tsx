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
import {
  isProxyStatusComponentSynced,
  isProxyStatusSynced,
} from '@backstage-community/plugin-kiali-common/func';
import { ProxyStatus } from '@backstage-community/plugin-kiali-common/types';
import { default as React } from 'react';
import { PFColors } from '../../components/Pf/PfColors';
import { kialiStyle } from '../../styles/StyleUtils';

type Props = {
  status?: ProxyStatus;
};

const smallStyle = kialiStyle({ fontSize: '70%', color: PFColors.White });
const colorStyle = kialiStyle({ fontSize: '1.1rem', color: PFColors.White });

export class ProxyStatusList extends React.Component<Props> {
  statusList = () => {
    if (!this.props.status) {
      return [];
    }

    return [
      { c: 'CDS', s: this.props.status.CDS },
      { c: 'EDS', s: this.props.status.EDS },
      { c: 'LDS', s: this.props.status.LDS },
      { c: 'RDS', s: this.props.status.RDS },
    ].map((value: { c: string; s: string }, _: number) => {
      if (!isProxyStatusComponentSynced(value.s)) {
        const status = value.s ? value.s : '-';
        return <div className={smallStyle}>{`${value.c}: ${status}`}</div>;
      }
      return null;
    });
  };

  render() {
    if (this.props.status && !isProxyStatusSynced(this.props.status)) {
      return (
        <div>
          <span className={colorStyle}>Istio Proxy Status</span>
          {this.statusList()}
        </div>
      );
    }
    return null;
  }
}
