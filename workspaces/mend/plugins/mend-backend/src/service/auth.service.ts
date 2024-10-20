import jwt from 'jsonwebtoken';
import { post } from '../api';
import { caesarCipherDecrypt } from './auth.service.helpers';
import {
  JwtAuthToken,
  JwtLicenceKeyPayload,
  LoginSuccessResponseData,
  MendConfig,
  RefreshAccessTokenSuccessResponseData,
} from './auth.services.types';

enum AuthRoutes {
  LOGIN = '/login',
  REFRESH_TOKEN = '/login/accessToken',
}

export class MendAuthSevice {
  private static authToken = '';
  private static refreshToken = '';
  private static baseUrl = '';
  private static clientEmail = '';
  private static clientKey = '';
  private static clientUrl = '';
  private static clientName = '';
  private static clientUuid = '';

  constructor(config: MendConfig) {
    MendAuthSevice.baseUrl = config.baseUrl;
    this.getConfig(config.activationKey);
  }

  private getConfig(activationKey: string) {
    const licenseKey = caesarCipherDecrypt(activationKey);
    const jwtPayload = jwt.decode(licenseKey) as JwtLicenceKeyPayload;
    MendAuthSevice.clientEmail = jwtPayload.integratorEmail;
    MendAuthSevice.clientKey = jwtPayload.userKey;
    MendAuthSevice.clientUrl = jwtPayload.wsEnvUrl;
  }

  private static async login(): Promise<void> {
    return post<LoginSuccessResponseData>(AuthRoutes.LOGIN, {
      body: {
        email: this.clientEmail,
        userKey: this.clientKey,
      },
    }).then(data => {
      this.refreshToken = data.response.refreshToken;
      return Promise.resolve();
    });
  }

  private static async refreshAccessToken(): Promise<void> {
    return post<RefreshAccessTokenSuccessResponseData>(
      AuthRoutes.REFRESH_TOKEN,
      {
        headers: {
          'wss-refresh-token': this.refreshToken,
        },
      },
    ).then(data => {
      this.authToken = data.response.jwtToken;
      this.clientName = data.response.orgName;
      this.clientUuid = data.response.orgUuid;
      return Promise.resolve();
    });
  }

  static async connect(): Promise<void> {
    return MendAuthSevice.login().then(() =>
      MendAuthSevice.refreshAccessToken(),
    );
  }

  static async validateAuthToken(url: string): Promise<void> {
    if (
      [AuthRoutes.LOGIN, AuthRoutes.REFRESH_TOKEN].includes(url as AuthRoutes)
    ) {
      return Promise.resolve();
    }

    if (!this.authToken) {
      return this.connect();
    }

    const token = jwt.decode(this.authToken) as JwtAuthToken;
    if (new Date(Number(`${token.exp}000`)).getTime() - Date.now() < 0) {
      return this.connect();
    }

    return Promise.resolve();
  }

  static getAuthToken(): string {
    return MendAuthSevice.authToken;
  }

  static getBaseUrl(): string {
    return MendAuthSevice.baseUrl;
  }

  static getOrganizationUuid(): string {
    return MendAuthSevice.clientUuid;
  }

  static getClientUrl(): string {
    return MendAuthSevice.clientUrl;
  }

  static getClientName(): string {
    return MendAuthSevice.clientName;
  }
}
