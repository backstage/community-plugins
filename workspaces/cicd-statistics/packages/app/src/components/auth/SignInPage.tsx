import {
  SignInPage as BackstageSignInPage,
  SignInProviderConfig,
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
