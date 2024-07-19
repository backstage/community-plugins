export interface Config {
  integrations: {
    pluginMeeweeTimeRegistration: {
      /**
       * The MeeWee's external API base URL
       * @visibility frontend
       */
      apiBaseUrl: string;
    };
    pluginMeeweeSignUp: {
      /**
       * The MeeWee's external Sign up URL
       * @visibility frontend
       */
      signUpUrl: string;
    };
  };
}
