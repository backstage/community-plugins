import { ConfigApi } from '@backstage/core-plugin-api';
import fetch, { RequestInit, Response } from 'node-fetch';

export class RequestHandler {
  private readonly configApi: ConfigApi;
  private cancelPreviousRequest: { [key: string]: (() => void) | undefined } =
    {};

  constructor(options: { configApi: ConfigApi }) {
    const { configApi } = options;
    this.configApi = configApi;
  }

  async send<T>(url: string, config: RequestInit): Promise<T | null> {
    const onSuccess = (response: Response): Promise<T | null> => {
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        return contentType && contentType.includes('text/plain')
          ? response.text()
          : response.json();
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    };

    const onError = (error: Error): T | null => {
      console.error('Request failed:', error.message);
      return null;
    };

    try {
      const isApiGetRegistrations = url === 'me/projects';
      if (isApiGetRegistrations && this.cancelPreviousRequest[url]) {
        this.cancelPreviousRequest[url]?.();
      }
      const controller = new AbortController();
      this.cancelPreviousRequest[url] = () => {
        if (controller && controller.abort) {
          controller.abort();
        }
      };

      const meeweeApiBaseUrl = this.configApi
        .getConfig('integrations.pluginMeeweeTimeRegistration')
        .getString('apiBaseUrl');

      const response = await fetch(`${meeweeApiBaseUrl}${url}`, {
        ...config,
        method: config.method || 'GET',
        timeout: 30000,
      });
      return onSuccess(response);
    } catch (error) {
      return onError(error as Error);
    }
  }
}
