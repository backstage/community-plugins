export interface Config {
  /** Configurations for the Nexus Repository Manager plugin */
  nexusRepositoryManager?: {
    /**
     * The base url of the Nexus Repository Manager instance.
     * @visibility frontend
     */
    proxyPath?: string;
    /**
     * Set to `true` to enable experimental annotations.
     * @visibility frontend
     */
    experimentalAnnotations?: boolean;
  };
}
