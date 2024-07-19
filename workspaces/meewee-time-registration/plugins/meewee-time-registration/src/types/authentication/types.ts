import { createApiRef } from '@backstage/core-plugin-api';
import { MultipleOrgUserData } from '../request/userProfile';

export const authenticationApiRef = createApiRef<AuthenticationApi>({
  id: 'plugin.meewee-time-registration.authentication',
});

export interface AuthenticationApi {
  fetchAuthToken(loginRequestParam: LoginRequestParam): Promise<string>;
  fetchUserProfile(params: { authToken: string }): Promise<MultipleOrgUserData>;
}

export type LoginRequestParam = {
  username: string;
  password: string;
  otp: string;
};
