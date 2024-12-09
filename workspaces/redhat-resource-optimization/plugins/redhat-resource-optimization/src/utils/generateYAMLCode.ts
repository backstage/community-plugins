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
import YAML from 'yaml';

export type YAMLCodeDataType = {
  limits: {
    cpu: number | string;
    memory: number | string;
  };
  requests: {
    cpu: number | string;
    memory: number | string;
  };
};

export const generateYAMLCode = (yamlCodeData: YAMLCodeDataType) => {
  const yamlCode = {
    limits: {
      cpu: yamlCodeData.limits.cpu,
      memory: yamlCodeData.limits.memory,
    },
    requests: {
      cpu: yamlCodeData.requests.cpu,
      memory: yamlCodeData.requests.memory,
    },
  };

  const yamlCodeString = YAML.stringify(yamlCode).replace(/"/g, ''); // prettify;

  return yamlCodeString;
};
