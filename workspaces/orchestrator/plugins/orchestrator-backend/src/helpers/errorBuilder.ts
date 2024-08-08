export const NO_DATA_INDEX_URL = 'NO_DATA_INDEX_URL';
export const NO_BACKEND_EXEC_CTX = 'NO_BACKEND_EXEC_CTX';
export const NO_CLIENT_PROVIDED = 'NO_CLIENT_PROVIDED';
export const NO_LOGGER = 'NO_LOGGER';
export const SWF_BACKEND_NOT_INITED = 'SWF_BACKEND_NOT_INITED';

export class ErrorBuilder {
  public static NewBackendError(name: string, message: string): Error {
    const e = new Error(message);
    e.name = name;
    return e;
  }

  public static GET_NO_DATA_INDEX_URL_ERR(): Error {
    return this.NewBackendError(
      NO_DATA_INDEX_URL,
      'No data index url specified or found',
    );
  }

  public static GET_NO_CLIENT_PROVIDED_ERR(): Error {
    return this.NewBackendError(
      NO_CLIENT_PROVIDED,
      'No or null graphql client',
    );
  }

  public static GET_SWF_BACKEND_NOT_INITED(): Error {
    return this.NewBackendError(
      SWF_BACKEND_NOT_INITED,
      'The SonataFlow backend is not initialized, call initialize() method before trying to get the workflows.',
    );
  }
}
