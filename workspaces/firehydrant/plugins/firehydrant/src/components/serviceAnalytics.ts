/*
 * Copyright 2021 The Backstage Authors
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
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { fireHydrantApiRef } from '../api';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';

export const useServiceAnalytics = ({
  serviceId,
  startDate,
  endDate,
}: {
  serviceId: string;
  startDate: string;
  endDate: string;
}) => {
  const api = useApi(fireHydrantApiRef);
  const errorApi = useApi(errorApiRef);

  const { loading, value, error, retry } = useAsyncRetry(async () => {
    try {
      return await api.getServiceAnalytics({
        serviceId: serviceId,
        startDate: startDate,
        endDate: endDate,
      });
    } catch (e) {
      errorApi.post(e);
      return Promise.reject(e);
    }
  });

  return {
    loading,
    value,
    error,
    retry,
  };
};
