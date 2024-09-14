// code based on https://github.com/shailahir/backstage-plugin-shorturl
/** @public */
export type ShortURL = {
  shortId: string;
  fullUrl: string;
  usageCount: number;
};
