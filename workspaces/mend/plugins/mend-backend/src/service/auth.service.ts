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
    this.getConfig(config.apiVersion, config.activationKey);
  }

  private getConfig(apiVersion: string, activationKey: string) {
    try {
      const licenseKey = caesarCipherDecrypt(activationKey);

      // Decode the license key and validate payload shape
      const decoded = jwt.decode(licenseKey);
      if (!decoded || typeof decoded !== 'object') {
        throw new Error(
          'Invalid activation key: could not decode license payload',
        );
      }
      const jwtPayload = decoded as JwtLicenceKeyPayload;

      const { wsEnvUrl, integratorEmail, userKey } =
        (jwtPayload as Partial<JwtLicenceKeyPayload>) || {};

      // Validate required fields presence and types
      if (
        !wsEnvUrl ||
        typeof wsEnvUrl !== 'string' ||
        !integratorEmail ||
        typeof integratorEmail !== 'string' ||
        !userKey ||
        typeof userKey !== 'string'
      ) {
        throw new Error(
          'Invalid activation key: missing required fields (wsEnvUrl, integratorEmail, userKey)',
        );
      }

      // Create a baseUrl from the environment url with safety checks
      let baseUrl: URL;
      try {
        baseUrl = new URL(wsEnvUrl);
      } catch {
        throw new Error('Invalid activation key: wsEnvUrl is not a valid URL');
      }
      baseUrl.hostname = `api-${baseUrl.hostname}`;
      baseUrl.pathname = `/api/${apiVersion}`;

      MendAuthSevice.baseUrl = baseUrl.toString();
      MendAuthSevice.clientEmail = integratorEmail;
      MendAuthSevice.clientKey = userKey;
      MendAuthSevice.clientUrl = wsEnvUrl;
    } catch (err) {
      // Log and reset to safe defaults, then rethrow so callers can decide how to handle it
      MendAuthSevice.baseUrl = '';
      MendAuthSevice.clientEmail = '';
      MendAuthSevice.clientKey = '';
      MendAuthSevice.clientUrl = '';
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  private static async login(): Promise<void> {
    return post<LoginSuccessResponseData>(AuthRoutes.LOGIN, {
      body: {
        email: this.clientEmail,
        userKey: this.clientKey,
      },
    })
      .then(data => {
        if (!data?.response?.refreshToken) {
          throw new Error('Login failed: missing refreshToken in response');
        }
        this.refreshToken = data.response.refreshToken;
        return Promise.resolve();
      })
      .catch(err => {
        this.refreshToken = '';
        return Promise.reject(err);
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
    )
      .then(data => {
        if (!data?.response?.jwtToken) {
          throw new Error('Refresh token failed: missing jwtToken in response');
        }
        this.authToken = data.response.jwtToken;
        this.clientName = data.response.orgName ?? '';
        this.clientUuid = data.response.orgUuid ?? '';
        return Promise.resolve();
      })
      .catch(err => {
        this.authToken = '';
        this.clientName = '';
        this.clientUuid = '';
        return Promise.reject(err);
      });
  }

  static async connect(): Promise<void> {
    return MendAuthSevice.login()
      .then(() => MendAuthSevice.refreshAccessToken())
      .catch(err => {
        return Promise.reject(err);
      });
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

    const decoded = jwt.decode(this.authToken);
    if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
      return this.connect();
    }

    const token = decoded as JwtAuthToken;
    const expMs = Number(token.exp) * 1000;
    if (Number.isNaN(expMs) || expMs - Date.now() < 0) {
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
