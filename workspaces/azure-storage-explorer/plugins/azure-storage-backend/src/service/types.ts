import { Config } from '@backstage/config';

export type BlobContainer = {
  accountName: string;
  authType: string;
  auth: Config;
};
