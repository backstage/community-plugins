# Setting up the development environment for OCM plugin

If you have installed the OCM plugin to the example application in the repository, run the `yarn start` command to access the plugin in the root directory and then navigate to `http://localhost:3000/ocm`.

To start a development setup in isolation with a faster setup and hot reloads, complete the following steps:

1. Run the `ocm-backend` plugin in the `plugins/ocm-backend` directory by executing the following command:

   ```console
   LEGACY_BACKEND_START=true yarn start
   ```

2. Run the `ocm` frontend plugin in the `plugins/ocm` directory using the following command:

   ```console
   yarn start
   ```

The previous steps are meant for local development and you can find the setup inside the `./dev` directories of the individual plugins.
