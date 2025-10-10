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
import { KIALI_PROVIDER } from '@backstage-community/plugin-kiali-common';
import {
  AuthInfo,
  MessageType,
} from '@backstage-community/plugin-kiali-common/types';
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import { default as React } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';
import {
  HelpDropdownActions,
  LoginActions,
  NamespaceActions,
} from '../actions';
import { IstioCertsInfoActions } from '../actions/IstioCertsInfoActions';
import { IstioStatusActions } from '../actions/IstioStatusActions';
import { MeshTlsActions } from '../actions/MeshTlsActions';
import { ProviderActions } from '../actions/ProviderAction';
import { ServerConfigActions } from '../actions/ServerConfigActions';
import { KialiHelper } from '../pages/Kiali/KialiHelper';
import { KialiNoResources } from '../pages/Kiali/KialiNoResources';
import {
  HelpDropdownStateReducer,
  IstioCertsInfoStateReducer,
  IstioStatusStateReducer,
  LoginReducer,
  MessageCenterReducer,
  NamespaceStateReducer,
  UserSettingsStateReducer,
} from '../reducers';
import { MeshTlsStateReducer } from '../reducers/MeshTlsState';
import { ProviderStateReducer } from '../reducers/Provider';
import { ServerConfigStateReducer } from '../reducers/ServerConfigState';
import { INITIAL_TRACING_STATE } from '../reducers/Tracing';
import { kialiApiRef } from '../services/Api';
import { AlertUtils } from '../utils/Alertutils';
import { PromisesRegistry } from '../utils/CancelablePromises';
import { initialStore } from './ConfigStore';
import { KialiContext } from './Context';

export enum ValidationCategory {
  configuration = 'configuration',
  authentication = 'authentication',
  versionSupported = 'versionSupported',
  networking = 'networking',
  unknown = 'unknown',
}

export type KialiChecker = {
  verify: boolean;
  category: ValidationCategory;
  missingAttributes?: string[];
  title?: string;
  message?: string;
  helper?: string;
  authData?: AuthInfo;
};

const initialChecker: KialiChecker = {
  verify: true,
  category: ValidationCategory.unknown,
};

interface Props {
  children: React.ReactNode;
  entity?: Entity;
}

export const KialiProvider: React.FC<Props> = ({
  children,
  entity,
}): JSX.Element => {
  const promises = new PromisesRegistry();
  const [kialiCheck, setKialiCheck] =
    React.useState<KialiChecker>(initialChecker);
  const [notHaveResources, setNotHaveResources] = React.useState<
    boolean | undefined
  >(undefined);
  const [loginState, loginDispatch] = React.useReducer(
    LoginReducer,
    initialStore.authentication,
  );
  const [meshTLSStatusState, meshTLSStatusDispatch] = React.useReducer(
    MeshTlsStateReducer,
    initialStore.meshTLSStatus,
  );
  const [statusState, statusDispatch] = React.useReducer(
    HelpDropdownStateReducer,
    initialStore.statusState,
  );
  const [messageState, messageDispatch] = React.useReducer(
    MessageCenterReducer,
    initialStore.messageCenter,
  );
  const [namespaceState, namespaceDispatch] = React.useReducer(
    NamespaceStateReducer,
    initialStore.namespaces,
  );
  const [providerState, providerDispatch] = React.useReducer(
    ProviderStateReducer,
    initialStore.providers,
  );
  const [userSettingState, userSettingDispatch] = React.useReducer(
    UserSettingsStateReducer,
    initialStore.userSettings,
  );
  const [istioStatusState, istioStatusDispatch] = React.useReducer(
    IstioStatusStateReducer,
    initialStore.istioStatus,
  );
  const [istioCertsState, istioCertsDispatch] = React.useReducer(
    IstioCertsInfoStateReducer,
    initialStore.istioCertsInfo,
  );
  const [serverConfigState, serverConfigDispatch] = React.useReducer(
    ServerConfigStateReducer,
    initialStore.serverConfig,
  );

  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(entity);
  const alertUtils = new AlertUtils(messageDispatch);
  const fetchNamespaces = async (provider: string) => {
    if (!namespaceState || !namespaceState.isFetching) {
      namespaceDispatch(NamespaceActions.requestStarted());
      return kialiClient
        .getNamespaces()
        .then(data => {
          namespaceDispatch(
            NamespaceActions.receiveList([...data], new Date()),
          );
          if (data.length > 0) {
            setNotHaveResources(false);
          } else {
            setNotHaveResources(true);
          }
          namespaceDispatch(
            NamespaceActions.receiveList([...data], new Date()),
          );
          namespaceDispatch(
            NamespaceActions.setActiveNamespaces([
              ...data.filter(ns => ns.cluster === provider),
            ]),
          );
        })
        .catch(() => namespaceDispatch(NamespaceActions.requestFailed()));
    }
    return () => {};
  };

  const fetchPostLogin = async (provider: string) => {
    try {
      const getAuthpromise = promises
        .register('getAuth', kialiClient.getAuthInfo())
        .then(response => {
          loginDispatch(LoginActions.loginSuccess(response.sessionInfo));
        });
      const getStatusPromise = promises
        .register('getStatus', kialiClient.getStatus())
        .then(response => {
          statusDispatch(HelpDropdownActions.statusRefresh(response));
        });
      const getMeshTLS = promises
        .register('getMeshTLS', kialiClient.getMeshTls())
        .then(response =>
          meshTLSStatusDispatch(MeshTlsActions.setinfo(response)),
        );
      const getIstioCerts = promises
        .register('getIstioCerts', kialiClient.getIstioCertsInfo())
        .then(resp => istioCertsDispatch(IstioCertsInfoActions.setinfo(resp)));
      const getServerConfig = promises
        .register('getServerConfig', kialiClient.getServerConfig())
        .then(resp => {
          // Convert ServerConfig to ComputedServerConfig by adding durations
          const computedConfig = {
            ...resp,
            durations: {}, // Will be computed by the reducer
          };
          serverConfigDispatch(
            ServerConfigActions.setServerConfig(computedConfig),
          );
        });
      const getIstioStatus = promises
        .register('getIstiostatus', kialiClient.getIstioStatus())
        .then(resp => istioStatusDispatch(IstioStatusActions.setinfo(resp)));
      await fetchNamespaces(provider);
      await Promise.all([
        getAuthpromise,
        getStatusPromise,
        getServerConfig,
        getMeshTLS,
        getIstioCerts,
        getIstioStatus,
      ]);
    } catch (err) {
      let errDetails: string | undefined = undefined;
      if (axios.isAxiosError(err)) {
        if (err.request) {
          const response = (err.request as XMLHttpRequest).responseText;
          if (response.trim().length > 0) {
            errDetails = response;
          }
        }
      }
      setKialiCheck({
        verify: false,
        category: ValidationCategory.unknown,
        message: `Error in axios: ${errDetails || err}`,
      });
    }
  };

  const fetchKiali = async () => {
    try {
      const status = await kialiClient.status();
      if ('verify' in status && !status.verify) {
        alertUtils.addError('Could not check configuration and authenticate');
        setKialiCheck(status);
      } else {
        if ('providers' in status) {
          providerDispatch(ProviderActions.setProviders(status.providers));
          providerDispatch(
            ProviderActions.setActiveProvider(status.providers[0]),
          );
          kialiClient.setAnnotation(KIALI_PROVIDER, status.providers[0]);
        }
        fetchPostLogin(status.providers[0]);
      }
    } catch (err) {
      let errDetails: string | undefined = undefined;
      if (axios.isAxiosError(err)) {
        if (err.request) {
          const response = (err.request as XMLHttpRequest).responseText;
          if (response.trim().length > 0) {
            errDetails = response;
          }
        }
        alertUtils.addError('Could not fetch auth info', err);
      }
      setKialiCheck({
        verify: false,
        category: ValidationCategory.networking,
        message: `Could not fetch auth info: ${errDetails || err}`,
      });
    }
  };

  const mockAlerts = () => {
    alertUtils.addMessage({
      content:
        '[Mock]Could not fetch Grafana info. Turning off links to Grafana.',
      detail: 'grafana URL is not set in Kiali configuration',
      group: 'default',
      type: MessageType.INFO,
      showNotification: false,
    });
    alertUtils.addMessage({
      content: '[Mock]Could not fetch Graph.',
      detail: 'Mock error fetching graph',
    });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchKiali();
      if (kialiClient.isDevEnv()) {
        mockAlerts();
      }
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  } else if (!!notHaveResources) {
    return <KialiNoResources entity={entity!} />;
  }

  return (
    <KialiContext.Provider
      value={{
        authentication: loginState,
        statusState: statusState,
        messageCenter: messageState,
        meshTLSStatus: meshTLSStatusState,
        namespaces: namespaceState,
        providers: providerState,
        userSettings: userSettingState,
        istioStatus: istioStatusState,
        istioCertsInfo: istioCertsState,
        serverConfig: serverConfigState,
        tracingState: INITIAL_TRACING_STATE,
        dispatch: {
          messageDispatch: messageDispatch,
          namespaceDispatch: namespaceDispatch,
          providerDispatch: providerDispatch,
          userSettingDispatch: userSettingDispatch,
          istioStatusDispatch: istioStatusDispatch,
          serverConfigDispatch: serverConfigDispatch,
        },
        alertUtils: alertUtils,
      }}
    >
      <KialiHelper check={kialiCheck} />
      {kialiCheck.verify && children}
    </KialiContext.Provider>
  );
};
