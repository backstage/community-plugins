export interface Config {
  resourceOptimization: {
    /**
     * @default "https://sso.redhat.com"
     *
     * @visibility backend
     */
    ssoBaseUrl?: string;

    /** @visibility backend */
    clientId: string;

    /** @visibility secret */
    clientSecret: string;
  };
}
