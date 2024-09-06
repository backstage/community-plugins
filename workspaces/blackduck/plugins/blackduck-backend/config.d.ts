export interface Config {
  blackduck: {
    /**
     * The default host name.
     * @visibility frontend
     */
    default: string;
    /**
     * An array of Black Duck hosts.
     */
    hosts: Array<{
      /**
       * Host name identifier.
       * @visibility frontend
       */
      name: string;
      /**
       * The host URL for the Black Duck instance.
       * @visibility frontend
       */
      host: string;
      /**
       * API token for authentication.
       * @visibility secret
       */
      token: string;
    }>;
  };
}
