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
import type { ComponentStatus } from '@backstage-community/plugin-kiali-common/types';
import { StatusTypes as Status } from '@backstage-community/plugin-kiali-common/types';
import { List, Typography } from '@material-ui/core';
import { IstioComponentStatus } from './IstioComponentStatus';

type Props = {
  status: ComponentStatus[];
};

export const IstioStatusList = (props: Props) => {
  const nonhealthyComponents = () => {
    return props.status.filter(
      (c: ComponentStatus) => c.status !== Status.Healthy,
    );
  };

  const coreComponentsStatus = () => {
    return nonhealthyComponents().filter((s: ComponentStatus) => s.is_core);
  };

  const addonComponentsStatus = () => {
    return nonhealthyComponents().filter((s: ComponentStatus) => !s.is_core);
  };

  const renderComponentList = () => {
    const groups = {
      core: coreComponentsStatus,
      addon: addonComponentsStatus,
    };

    return ['core', 'addon'].map((group: string) =>
      // @ts-expect-error
      groups[group]().map((status: ComponentStatus) => (
        <IstioComponentStatus
          key={`status-${group}-${status.name}`}
          componentStatus={status}
        />
      )),
    );
  };

  return (
    <div style={{ color: 'white', backgroundColor: 'black' }}>
      <Typography variant="h6">Istio Components Status</Typography>
      <List dense id="istio-status" aria-label="Istio Component List">
        {renderComponentList()}
      </List>
    </div>
  );
};
