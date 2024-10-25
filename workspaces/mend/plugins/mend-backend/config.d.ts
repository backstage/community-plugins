export type Config = {
  mend: {
    /**
     * @visibility secret
     */
    activationKey: string;
    /**
     * @visibility backend
     */
    baseUrl: string;
  };
};
