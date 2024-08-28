export interface Config {
  /**
   * Configuration values for Report Portal plugin
   * @visibility frontend
   */
  reportPortal: {
    /**
     * A link in form of Email template
     * @example
     * supportEmailTemplate: `mailto://example@company.com?subject=${subject}&body=${body}`
     * // where 'subject' and 'body' must be in url-encoded format
     *
     * @see https://www.mail-signatures.com/articles/mailto-links-emails/
     * @visibility frontend
     */
    supportEmailTemplate?: string;
    /**
     * @visibility frontend
     */
    integrations: Array<{
      /**
       * Host of report portal url
       * @visibility frontend
       */
      host: string;
      /**
       * Base api url for report portal instance, add trailing '/' in url
       * @visibility backend
       */
      baseUrl: string;
      /**
       * The Api token that will be used to
       * @visibility secret
       */
      token: string;
      /**
       * Filter type to apply for current host
       * @visibility frontend
       */
      filterType: string;
    }>;
  };
}
