# apollo-explorer

Welcome to the Apollo Explorer plugin!

This plugin allows users to directly embed an [Apollo](https://www.apollographql.com) graph explorer directly into
Backstage!

## Getting started

### Getting an Apollo Graph Reference

First things first, you will need an Apollo account, and a graph imported into your account. This is beyond the scope of
this plugin, so if you are totally new to Apollo, please reference their official
documentation [here](https://www.apollographql.com/docs).

Once you have a graph set up in Apollo, we need to grab the graph reference. First, go to your Apollo graphs home page and choose the graph you wish to embed.

![Apollo Graph List](./docs/img/apollo-graph-list.png)

Once you are in your graph explorer, click the dropdown next to the share icon and select `Share as Embedded`

![Share as Embedded](./docs/img/share-as-embedded.png)

This modal contains a number of useful properties, all of which can be passed to the plugin via the component properties, but the only mandatory input we need from here is the `graphRef`.

![Graph Ref](./docs/img/graph-ref.png)

Hold on to this snippet for a second while we set up the plugin ✨

### Installing the Backstage Plugin

First, add the plugin to your Backstage app

```shell
yarn --cwd packages/app add @backstage-community/plugin-apollo-explorer
```

Then, in `packages/app/src/App.tsx` add the plugin as a `Route`

```typescript
import { ApolloExplorerPage } from '@backstage-community/plugin-apollo-explorer';

const routes = (
  <FlatRoutes>
    {/* other routes... */}
    <Route
      path="/apollo-explorer"
      element={
        <ApolloExplorerPage
          endpoints={[
            { title: 'Github', graphRef: 'my-github-graph-ref@current' },
            { title: 'Linear', graphRef: 'my-linear-graph-ref@current' },
          ]}
        />
      }
    />
```

Then, in `packages/app/src/components/Root/Root.tsx` add a sidebar item so users can find your beautiful plugin!

```typescript
<SidebarItem icon={GraphiQLIcon} to="apollo-explorer" text="Apollo Explorer" />
```

That's it! You should now see an `Apollo Explorer` item in your sidebar, and if you click it, you should see your graph(s) load and direct you to authenticate via Apollo!

![Needs Auth](./docs/img/needs-auth.png)

Once you authenticate, your graph is ready to use 🚀

![Logged In](./docs/img/logged-in.png)

### Authentication Tokens for Apollo Studio

If you need to utilize an ApiRef to supply a token to Apollo, you may do so using an ApiHolder.

In `packages/app/src/App.tsx` perform the following modifications from above. The import `ssoAuthApiRef` is used as an example and **does not exist**.

```typescript
import { ApolloExplorerPage, EndpointProps } from '@backstage-community/plugin-apollo-explorer';
import { ssoAuthApiRef } from '@companyxyz/devkit';
import { ApiHolder } from '@backstage/core-plugin-api';

async function authCallback(options: { apiHolder: ApiHolder }): Promise<{token: string}> {
  const sso = options.apiHolder.get<any>(ssoAuthApiRef)
  return await sso.getToken()
}

const routes = (
  <FlatRoutes>
    {/* other routes... */}
    <Route
      path="/apollo-explorer"
      element={
        <ApolloExplorerPage
          endpoints={[{
            title: 'Github',
            graphRef: 'my-github-graph-ref@current',
            authCallback: authCallback
          }]}
        />
      }
    />
```
