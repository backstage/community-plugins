import { MendApi } from '../api';

export type Query = {
  connectApi: MendApi;
  fetchApi: typeof fetch;
  signal: AbortSignal;
};
