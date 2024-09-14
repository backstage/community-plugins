// code based on https://github.com/shailahir/backstage-plugin-shorturl
import { ShortURL } from '../types';
import { createApiRef } from '@backstage/core-plugin-api';

/** @public */
export const shorturlApiRef = createApiRef<ShortURLApi>({
  id: 'plugin.shorturl.api',
});

/** @public */
export interface ShortURLApi {
  /**
   * Generates a unique short id for a url and saves in database.
   * @param shortURLRequest
   */
  createOrRetrieveShortUrl(
    shortURLRequest: Omit<ShortURL, 'shortId'>,
  ): Promise<Response>;

  getMappingData(): Promise<Response>;
}
