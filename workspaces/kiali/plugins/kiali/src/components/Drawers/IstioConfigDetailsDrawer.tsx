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
  DRAWER,
  IstioConfigDetails,
} from '@backstage-community/plugin-kiali-common/types';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress } from '@material-ui/core';
import { default as React } from 'react';
import { IstioConfigInfo } from '../../pages/IstioConfigDetails/IstioConfigInfo';
import { kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';

type Props = {
  namespace: string;
  istioType: string;
  name: string;
};

export const IstioConfigDetailsDrawer = (props: Props) => {
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [istioConfig, setIstioConfig] = React.useState<IstioConfigDetails>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    if (!props.namespace || !props.istioType || !props.name) {
      setIstioConfig(undefined);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setIstioConfig(undefined);

    kialiClient
      .getIstioConfigDetail(props.namespace, props.istioType, props.name, true)
      .then((istioConfigResponse: IstioConfigDetails) => {
        if (cancelled) {
          return;
        }
        if (
          istioConfigResponse &&
          Object.keys(istioConfigResponse).length > 0
        ) {
          setIstioConfig(istioConfigResponse);
        }
      })
      .catch(err => {
        if (!cancelled) {
          kialiState.alertUtils!.add(
            `Error fetching Istio config: ${err.message || 'Unknown error'}`,
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    kialiClient,
    kialiState.alertUtils,
    props.name,
    props.namespace,
    props.istioType,
  ]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      {istioConfig && (
        <IstioConfigInfo istioConfig={istioConfig} view={DRAWER} />
      )}
    </>
  );
};
