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
  SignInProviderConfig,
  SignInPage as BackstageSignInPage,
} from '@backstage/core-components';
import { gitlabAuthApiRef, SignInPageProps } from '@backstage/core-plugin-api';
import React from 'react';

const gitlabProvider: SignInProviderConfig = {
  id: 'gitlab-auth-provider',
  title: 'GitLab',
  message: 'Sign In using GitLab',
  apiRef: gitlabAuthApiRef,
};

export const SignInPage = (props: SignInPageProps) => {
  return <BackstageSignInPage {...props} auto providers={[gitlabProvider]} />;
};
