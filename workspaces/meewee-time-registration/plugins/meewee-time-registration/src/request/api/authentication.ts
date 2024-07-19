import { ConfigApi } from '@backstage/core-plugin-api';
import {
  AuthenticationApi,
  LoginRequestParam,
} from '../../types/authentication/types';
import buildRequestHeader from '../buildRequestHeader';
import { RequestHandler } from './requestHandler';
import { MultipleOrgUserData } from '../../types/request/userProfile';
import { buildTransitData } from './transitBuilder/transitResponseBuilder';

export class AuthenticationClient implements AuthenticationApi {
  private readonly requestHandler: RequestHandler;

  constructor(options: { configApi: ConfigApi }) {
    this.requestHandler = new RequestHandler(options);
  }

  async fetchAuthToken(loginRequestParam: LoginRequestParam): Promise<string> {
    const header = buildRequestHeader();
    const response = await this.requestHandler.send<string>('login', {
      method: 'POST',
      body: JSON.stringify(loginRequestParam),
      headers: header,
    });
    return response || '';
  }

  async fetchUserProfile(params: {
    authToken: string;
  }): Promise<MultipleOrgUserData> {
    const header = buildRequestHeader(params.authToken);
    const response = await this.requestHandler.send<MultipleOrgUserData>('me', {
      headers: header,
    });
    const userProfileData = buildTransitData<MultipleOrgUserData>(
      JSON.stringify(response),
      'buildMultipleOrgUserProfileResponseData',
    );

    return userProfileData;
  }
}
