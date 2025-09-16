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

import { useApi } from '@backstage/core-plugin-api';
import { BusinessApplication } from '../../../api/cmdb/types';

import { useEffect, useState } from 'react';
import { serviceNowApiRef } from '../../../api/ServiceNowBackendClient';

const emptyServiceDetails = {} as BusinessApplication;

/** @public */
export function useServiceDetails(appCode: string) {
  const serviceNowApi = useApi(serviceNowApiRef);
  const [serviceDetails, setServiceDetails] =
    useState<BusinessApplication>(emptyServiceDetails);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    serviceNowApi.getBusinessApplication(appCode).then(response => {
      setServiceDetails(response.result[0]);
      setLoading(false);
    });
  }, [serviceNowApi, appCode]);

  return { loading, serviceDetails };
}
