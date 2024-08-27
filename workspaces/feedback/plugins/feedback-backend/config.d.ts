/**
 * Configuration options for the application.
 */
export interface Config {
  /**
   * @visibility frontend
   */
  feedback?: {
    integrations: {
      /**
       * Configuration options for JIRA integration.
       * It is an array, which can be used to set up multiple jira servers at the same time.
       * @visibility frontend
       */
      jira?: Array<{
        /**
         * The hostname or URL of the JIRA organization.
         * @visibility frontend
         */
        host?: string;
        /**
         * The access token for authenticating with JIRA.
         * @visibility secret
         */
        token?: string;
        /**
         * what type of jira instance are you using, CLOUD/SERVER
         */
        hostType?: string;
      }>;

      /**
       * Configuration options for email integration.
       */
      email?: {
        /**
         * The SMTP server's hostname or IP address.
         */
        host?: string;

        /**
         * The port number to use for the SMTP server.
         */
        port?: number;

        /**
         * Optional authentication settings for the SMTP server.
         */
        auth?: {
          /**
           * The username to use for SMTP server authentication.
           */
          user?: string;

          /**
           * The password to use for SMTP server authentication.
           * @visibility secret
           */
          password?: string;
        };

        /**
         * Set to `true` if you want to use SSL/TLS for the SMTP connection.
         * Default is `false`.
         */
        secure?: boolean;

        /**
         * The email address from which emails will be sent.
         */
        from?: string;

        /**
         * Path to a custom CA certificate file.
         */
        caCert?: string;
      };
    };
  };
}
