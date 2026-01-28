export interface Config {
  mta: {
    /**
     * Base URL of the MTA instance
     * @visibility backend
     */
    url: string;
    /**
     * Service account authentication for MTA
     */
    providerAuth: {
      /**
       * Keycloak realm name
       * @visibility backend
       */
      realm?: string;
      /**
       * Service account client ID
       * @visibility backend
       */
      clientID: string;
      /**
       * Service account client secret
       * @visibility secret
       */
      secret: string;
    };
  };
}
