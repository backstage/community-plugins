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
import { ComputedServerConfig } from '@backstage-community/plugin-kiali-common/types';
import { useContext } from 'react';
import { ServerConfigActions } from '../actions/ServerConfigActions';
import { KialiContext } from '../store/Context';

export const useServerConfig = () => {
  const context = useContext(KialiContext) as any;

  if (!context) {
    throw new Error('useServerConfig must be used within a KialiProvider');
  }

  const { serverConfig, dispatch } = context;

  const setServerConfig = (config: ComputedServerConfig) => {
    dispatch.serverConfigDispatch(ServerConfigActions.setServerConfig(config));
  };

  const setServerConfigLoaded = (loaded: boolean) => {
    dispatch.serverConfigDispatch(
      ServerConfigActions.setServerConfigLoaded(loaded),
    );
  };

  return {
    serverConfig: serverConfig.config,
    isLoaded: serverConfig.isLoaded,
    setServerConfig,
    setServerConfigLoaded,
  };
};
