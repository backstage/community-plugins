# shorturl

Welcome to the shorturl plugin!

## Setup

### Backend

You need to setup the [ShortURL backend plugin](https://github.com/backstage/community-plugins/tree/main/workspaces/shorturl/plugins/shorturl-backend) before you move forward with any of these steps if you haven't already.

### Installation

Install this plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-shorturl
```

### ShortURLs

Add the `ShortURLPage` and `ShortURLGo` components to your app routes in `packages/app/src/App.tsx`.

```diff
+ import { ShortURLGo, ShortURLPage } from '@backstage-community/plugin-shorturl';

  const routes = (
    <FlatRoutes>
+     <Route path="/go/:id" element={<ShortURLGo />} />
+     <Route path="/shorturl" element={<ShortURLPage />} />
      {/* other routes... */}
    </FlatRoutes>
  )
```

## Local development

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/shorturl](http://localhost:3000/shorturl).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
