export interface Config {
  blackduck: {
    /**
     * @visibility frontend
     */
    host: string;
    /**
     * @visibility secret
     */
    token: string;
  };
}
