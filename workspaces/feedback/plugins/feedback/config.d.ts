/**
 * Configuration options for the application.
 */
export interface Config {
  /**
   * @visibility frontend
   */
  feedback?: {
    /**
     * @visibility frontend
     */
    summaryLimit?: number;
    /**
     * @visibility frontend
     */
    baseEntityRef: string;
    /**
     * @visibility frontend
     * */
    integrations: {
      /**
       * Configuration options for JIRA integration.
       * It is an array, which can be used to set up multiple jira servers at the same time.
       */
      jira?: Array<{
        /**
         * The hostname or URL of the JIRA organization.
         * @visibility frontend
         */
        host: string;
      }>;
    };
  };
}
