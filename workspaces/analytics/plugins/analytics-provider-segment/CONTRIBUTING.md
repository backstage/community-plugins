# Setting up the development environment for Analytics Provider Segment plugin

If you would like to contribute improvements to this plugin, the easiest way to
make and test changes is to do the following:

> 1.  Clone the main Backstage monorepo `git clone git@github.com:backstage/community-plugins.git`
> 2.  Install all dependencies `yarn install`
> 3.  Navigate to the analytics' workspace `cd workspaces/analytics`
> 4.  If one does not exist, create an `app-config.local.yaml` file and add config for this plugin (see below)
> 5.  Install the dependencies for the workspace `yarn install`
> 6.  Enter this plugin's working directory: `cd plugins/analytics-provider-segment`
> 7.  Start the plugin in isolation: `yarn start`
> 8.  Navigate to the playground page at `http://localhost:3000/segment`
> 9.  Open the web console to see events fire when you navigate or when you
>     interact with instrumented components.

Code for the isolated version of the plugin can be found inside the `./dev`
directory. Changes to the plugin are hot-reloaded.
