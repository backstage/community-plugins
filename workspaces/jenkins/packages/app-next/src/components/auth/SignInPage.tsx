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
  return <BackstageSignInPage {...props} auto providers={[githubProvider]} />;
};
