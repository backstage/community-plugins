import { SignInPage as BackstageSignInPage } from '@backstage/core-components';
import { SignInPageProps } from '@backstage/core-plugin-api';
import React from 'react';

export const SignInPage = (props: SignInPageProps) => {
  return <BackstageSignInPage {...props} auto providers={[]} />;
};
