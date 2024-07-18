import {
  SignInPage as BackstageSignInPage,
  SignInProviderConfig,
} from '@backstage/core-components';
import {
  IdentityApi,
  discoveryApiRef,
  githubAuthApiRef,
  useApi,
  SignInPageProps,
} from '@backstage/core-plugin-api';
import React from 'react';
import { setTokenCookie } from './cookieAuth';

const githubProvider: SignInProviderConfig = {
  id: 'github-auth-provider',
  title: 'GitHub',
  message: 'Sign In using GitHub',
  apiRef: githubAuthApiRef,
};

export const SignInPage = (props: SignInPageProps) => {
  const discoveryApi = useApi(discoveryApiRef);

  return (
    <BackstageSignInPage
      {...props}
      auto
      providers={[githubProvider]}
      onSignInSuccess={async (identityApi: IdentityApi) => {
        setTokenCookie(await discoveryApi.getBaseUrl('cookie'), identityApi);

        props.onSignInSuccess(identityApi);
      }}
    />
  );
};
