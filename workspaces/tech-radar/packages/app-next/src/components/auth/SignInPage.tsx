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
  SignInPage as BackstageSignInPage,
  SignInProviderConfig,
} from '@backstage/core-components';
import { githubAuthApiRef, SignInPageProps } from '@backstage/core-plugin-api';
import React from 'react';

const githubProvider: SignInProviderConfig = {
  id: 'github-auth-provider',
  title: 'GitHub',
  message: 'Sign In using GitHub',
  apiRef: githubAuthApiRef,
};

export const SignInPage = (props: SignInPageProps) => {
  return (
    <BackstageSignInPage
      {...props}
      auto
      // providers={['guest']} // use this line to test URLReader without configured integrations
      providers={[githubProvider]}
    />
  );
};
