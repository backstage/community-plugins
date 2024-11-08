# Setting up the development environment for Analytics Provider Segment plugin

If you would like to contribute improvements to this plugin, the easiest way to
make and test changes is to do the following:

> 1.  Clone the main Backstage monorepo `git clone git@github.com:backstage-community/backstage-plugins.git`
> 2.  Install all dependencies `yarn install`
> 3.  If one does not exist, create an `app-config.local.yaml` file in the root of
>     the monorepo and add config for this plugin (see below)
> 4.  Enter this plugin's working directory: `cd plugins/analytics-provider-segment`
> 5.  Start the plugin in isolation: `yarn start`
> 6.  Navigate to the playground page at `http://localhost:3000/segment`
> 7.  Open the web console to see events fire when you navigate or when you
>     interact with instrumented components.

Code for the isolated version of the plugin can be found inside the `./dev`
directory. Changes to the plugin are hot-reloaded.
