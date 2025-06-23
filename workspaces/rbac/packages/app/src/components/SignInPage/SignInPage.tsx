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
import {
  SignInPage as CCSignInPage,
  IdentityProviders,
} from '@backstage/core-components';
import {
  configApiRef,
  githubAuthApiRef,
  useApi,
  type SignInPageProps,
} from '@backstage/core-plugin-api';
import { oidcAuthApiRef } from '../../apis';

const providers: IdentityProviders = [
  {
    id: 'github-auth-provider',
    title: 'GitHub',
    message: 'Sign in using GitHub',
    apiRef: githubAuthApiRef,
  },
  'guest',
];

export function SignInPage(props: SignInPageProps): React.JSX.Element {
  const configApi = useApi(configApiRef);
  const oidcProvider = configApi.getOptionalConfig('auth.providers.oidc');

  if (oidcProvider) {
    providers.push({
      id: 'oidc-auth-provider',
      title: 'OIDC',
      message: 'Sign in using OIDC',
      apiRef: oidcAuthApiRef,
    });
  }

  return (
    <CCSignInPage
      {...props}
      title="Select a sign-in method"
      auto
      providers={providers}
    />
  );
}
