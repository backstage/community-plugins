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

import { Config } from '@backstage/config';

/**
 * @public
 */
export type DeploymentProfile = 'saas' | 'onprem' | 'cloud';
/**
 * @public
 */
export type AuthMethod = 'accessKey' | 'universalIdentity' | 'cloudIam';
/**
 * @public
 */
export type CloudProvider = 'aws_iam' | 'azure_ad' | 'gcp';

/**
 * Resolved Akeyless plugin configuration.
 * @public
 */
export type AkeylessConfig = {
  deploymentProfile: DeploymentProfile;
  gatewayUrl: string;
  consoleUrl: string;
  allowCrud: boolean;
  authentication: {
    method: AuthMethod;
    accessKey?: { accessId: string; accessKey: string };
    universalIdentity?: { uidToken: string };
    cloudIam?: { accessId: string; provider: CloudProvider };
  };
};

const DEFAULT_GATEWAY_URL = 'https://api.akeyless.io';
const DEFAULT_CONSOLE_URL = 'https://console.akeyless.io';

function resolveAuthMethod(config: Config): AuthMethod {
  const explicit = config.getOptionalString(
    'akeyless.authentication.method',
  ) as AuthMethod | undefined;
  if (explicit) {
    return explicit;
  }
  if (config.has('akeyless.authentication.universalIdentity.uidToken')) {
    return 'universalIdentity';
  }
  if (config.has('akeyless.authentication.cloudIam.accessId')) {
    return 'cloudIam';
  }
  return 'accessKey';
}

function validateProfile(profile: DeploymentProfile, method: AuthMethod): void {
  const allowed: Record<DeploymentProfile, AuthMethod[]> = {
    saas: ['accessKey'],
    onprem: ['accessKey', 'universalIdentity'],
    cloud: ['accessKey', 'cloudIam'],
  };

  if (!allowed[profile].includes(method)) {
    throw new Error(
      `Authentication method '${method}' is not valid for deployment profile '${profile}'. ` +
        `Allowed methods: ${allowed[profile].join(', ')}`,
    );
  }
}

export function getAkeylessConfig(config: Config): AkeylessConfig {
  const deploymentProfile =
    (config.getOptionalString('akeyless.deploymentProfile') as
      | DeploymentProfile
      | undefined) ?? 'saas';
  const gatewayUrl =
    config.getOptionalString('akeyless.gatewayUrl') ?? DEFAULT_GATEWAY_URL;
  const consoleUrl =
    config.getOptionalString('akeyless.consoleUrl') ?? DEFAULT_CONSOLE_URL;
  const method = resolveAuthMethod(config);

  validateProfile(deploymentProfile, method);

  const authentication: AkeylessConfig['authentication'] = { method };

  if (method === 'accessKey') {
    authentication.accessKey = {
      accessId: config.getString('akeyless.authentication.accessKey.accessId'),
      accessKey: config.getString(
        'akeyless.authentication.accessKey.accessKey',
      ),
    };
  }

  if (method === 'universalIdentity') {
    authentication.universalIdentity = {
      uidToken: config.getString(
        'akeyless.authentication.universalIdentity.uidToken',
      ),
    };
  }

  if (method === 'cloudIam') {
    authentication.cloudIam = {
      accessId: config.getString('akeyless.authentication.cloudIam.accessId'),
      provider: config.getString(
        'akeyless.authentication.cloudIam.provider',
      ) as CloudProvider,
    };
  }

  return {
    deploymentProfile,
    gatewayUrl,
    consoleUrl,
    allowCrud: config.getOptionalBoolean('akeyless.allowCrud') ?? true,
    authentication,
  };
}
