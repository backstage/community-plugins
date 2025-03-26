/*
 * Copyright 2025 The Backstage Authors
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
import { useState, useEffect } from 'react';
import {
  useApi,
  fetchApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

export const QueryACSData = (deploymentName: string) => {
  /* eslint-disable consistent-return */
  const [result, setResult] = useState([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  // Retrieve proxy url from api
  const discoveryApi = useApi(discoveryApiRef);
  let backendUrl = '';
  discoveryApi.getBaseUrl('proxy').then(value => (backendUrl = value));

  const fetchApi = useApi(fetchApiRef);

  const convertDeploymentNameStringToArray = () => {
    return deploymentName.split(',');
  };

  const getACSData = () => {
    const deploymentNameArr = convertDeploymentNameStringToArray();

    deploymentNameArr.forEach((name: string) => {
      fetchApi
        .fetch(
          `${backendUrl}/acs/v1/export/vuln-mgmt/workloads?query=Deployment%3A${name}`,
        )
        .then(response => response.text())
        .then(text => {
          const lines = text.split('\n');

          const jsonData = lines.map(line => {
            if (line.trim()) {
              // Skip empty lines
              return JSON.parse(line);
            }
          });

          jsonData.pop();

          setLoaded(true);
          setResult(prevResult => ({ ...prevResult, jsonData }));
        })
        .catch(_error => {
          setError(true);
          throw new Error(`Error fetching ACS data`);
        });
    });
  };

  useEffect(() => {
    getACSData();
    // eslint-disable-next-line
  }, [backendUrl]);

  return { result, loaded, error };
};
