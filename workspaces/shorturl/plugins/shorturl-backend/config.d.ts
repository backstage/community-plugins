export interface Config {
  shorturl?: {
    /**
     * Lenght of the short URL
     * defaults to 8
     */
    length?: number;
    /**
     * Set of characters to use in the short URL
     * defaults to 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz0123456789-'
     */
    alphabet?: string;
  };
}
