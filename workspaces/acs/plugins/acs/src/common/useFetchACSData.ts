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

// @TODO: This is a temporary solution. We should define the types for the data more clearly.
export type ACSDataResult = {
  jsonData: {
    result: {
      deployment: any;
      images: any[];
      livePods: number;
    }[];
  }[];
};

// @TODO: Consider calling this something more descriptive like useFetchWorkloadsByDeployments.
// @TODO: Consider renaming deploymentName to deploymentNamesCsv or deploymentNamesString to be more correct.
export const useFetchACSData = (deploymentName: string) => {
  const [result, setResult] = useState<ACSDataResult>({ jsonData: [] });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  // Retrieve proxy url from api
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const getACSData = async () => {
    try {
      setIsLoading(true);
      setError(false);

      const backendUrl = await discoveryApi.getBaseUrl('proxy');

      const results = await fetchApi
        .fetch(
          `${backendUrl}/acs/v1/export/vuln-mgmt/workloads?query=Deployment%3A${deploymentName}`,
        )
        .then(response => response.text())
        .then(text => {
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const jsonData = lines.map(line => JSON.parse(line));
          return jsonData;
        });

      setResult({ jsonData: results });
    } catch (err) {
      // @TODO: Add more optimal error handling. Consider passing the error message and displaying it in the UI.
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getACSData();
    // eslint-disable-next-line
  }, []);

  return { result, isLoading, error };
};
