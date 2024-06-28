// TESTO
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const client = axios?.create({});

const cancelPreviousRequest: { [key: string]: (() => void) | undefined } = {};

const request = async <T>(config: AxiosRequestConfig): Promise<T | null> => {
  const onSuccess = (response: AxiosResponse): any => response;

  const onError = (error: AxiosError) => {
    try {
      const { response, message } = error
        ? error
        : { response: { status: 99 }, message: 'The request timed out.' };

      if (response) {
        let statusMessage =
          'Unexpected error occurred. Please try again later.';
        if (response.status && response.status === 401) {
          statusMessage = 'Unauthorized';
        }
        if (response.data) {
          statusMessage = (response.data as string) || statusMessage;
        }
        Promise.reject(new Error(`${statusMessage}`)).catch(err => {
          console.log('error:', err);
          return err;
        });
      }

      const err = new Error(message ? message : 'Something went wrong');
      if (message.includes('timeout')) {
        new Error(err.message);
      }

      return null;
    } catch (e) {
      return null;
    }
  };

  try {
    const url = config?.url?.split('?')[0] || '';
    const isApiGetRegistrations = url === 'me/projects';
    if (isApiGetRegistrations && cancelPreviousRequest[url]) {
      cancelPreviousRequest[url]?.();
    }
    const controller = new AbortController();
    cancelPreviousRequest[url] = () => {
      if (controller && controller.abort) {
        controller.abort();
      }
    };

    const response = await client({
      baseURL: 'https://api.staging.meewee.com/0/',
      //signal: isApiGetRegistrations ? controller.signal : undefined,
      timeout: 30000,
      timeoutErrorMessage: 'The request timed out.',
      ...config,
      method: config.method || 'GET',
    });
    return onSuccess(response);
  } catch (error) {
    return onError(error as AxiosError);
  }
};

export default request;
