export interface Config {
  odo: {
    /**
       * Path to the odo binary.
       * Note that when installing the custom actions, the latest version of odo is always downloaded.
       * But this config option allows to use a different binary if needed.
       * @visibility backend
       */
    binaryPath: string | undefined;
    telemetry: {
      /**
       * odo telemetry status
       * @visibility backend
       */
      disabled: boolean | undefined;
    },
    devfileRegistry: {
      /**
       * devfile registry URL
       * @visibility backend
       */
      url: string | undefined;
    };
  };
}
