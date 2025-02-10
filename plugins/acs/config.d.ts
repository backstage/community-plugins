export interface Config {
  app: {
    /**
     * ACS Plugin Configuration
     * @visibility frontend
     */
    acs: {
      /**
       * ACS URL
       * @visibility frontend
       */
      acsUrl: string;
    };
  };
}
