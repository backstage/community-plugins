# Bookmarks plugin

[![NPM Version](https://img.shields.io/npm/v/%40backstage-community%2Fplugin-bookmarks)](https://www.npmjs.com/package/@backstage-community/plugin-bookmarks)
[![Backstage version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbackstage%2Fcommunity-plugins%2Frefs%2Fheads%2Fmain%2Fworkspaces%2Fbookmarks%2Fbackstage.json&query=%24.version&logo=backstage&label=backstage&color=%2331a792)](https://github.com/backstage/community-plugins/blob/main/workspaces/bookmarks/backstage.json)
[![GitHub License](https://img.shields.io/github/license/backstage/community-plugins)](https://github.com/backstage/community-plugins/blob/main/LICENSE)

The Bookmarks plugin is a simple tool for saving and viewing links to your favorite websites, Google Docs, and other online resources directly within Backstage.

Bookmarks are stored in the `metadata` of a Backstage entity, making it easy to manage and access them within your Backstage Software Catalog.

![A screenshot of the Bookmarks plugin](https://i.imgur.com/guMtiax.png)

## Installation

To install the Bookmarks plugin, follow these steps:

1. Install `@backstage-community/plugin-bookmarks` to your frontend packages

```bash
yarn --cwd packages/app add @backstage-community/plugin-bookmarks
```

2. Then, depending on your Backstage version, follow the appropriate instructions below to add the plugin to your entity page.
   - **New frontend system**: Register the plugin in your `App.tsx`:

     ```diff
     // In your packages/app/src/App.tsx

     +import bookmarksPlugin from '@backstage-community/plugin-bookmarks';

     const app = createApp({
       features: [
         // other features...
         catalogPlugin,
     +   bookmarksPlugin,
       ],
     });
     ```

   - **Legacy frontend system**: Add `EntityBookmarksContent` to the `EntityPage` routes:

     ```diff
     // In your packages/app/src/components/EntityPage.tsx
     +import { EntityBookmarksContent, isBookmarksAvailable } from '@backstage-community/plugin-bookmarks';

     // add to defaultEntityPage, etc. to see them in the other entity pages
     const serviceEntityPage = (
       <EntityLayout>
         {/* other routes */}
     +   <EntityLayout.Route path="/bookmarks" title="Bookmarks" if={isBookmarksAvailable}>
     +     <EntityBookmarksContent />
     +   </EntityLayout.Route>
       </EntityLayout>
     );
     ```

3. Add bookmarks to your entities by including them in the `metadata` section of the entity YAML file:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
spec: # spec fields here...
metadata:
  name: my-component
  bookmarks:
    'Cool link': https://example.com/cool-link
```

4. Done! Enjoy your bookmarks by visiting the updated entity page in Backstage through your company catalog.

## Configuration

You can configure custom protocols for bookmarks in your `app-config.yaml` file. This allows you to define how certain types of links should be handled, including their iframe and link URLs.

The `%s` placeholder in the URLs will be replaced with the content of the URL after the protocol. For example, if you have a bookmark with the URL `gdoc:12345?usp=sharing#!SECTION`, the `%s` will be replaced with `12345?usp=sharing#!SECTION`.

For example, to add support for Google Docs, you can add the following configuration:

```yaml
bookmarks:
  customProtocols:
    gdoc:
      iframeBaseUrl: https://docs.google.com/document/d/%s/mobilebasic
      linkBaseUrl: https://docs.google.com/document/d/%s/edit
```

Once this configuration is added, you can create bookmarks using the `gdoc:` protocol, and they will be displayed correctly in the Bookmarks plugin:

```yaml
# omitted...
metadata:
  bookmarks:
    'My life story': gdoc:1qaLicIa3FZKyup4JXo9ivNgWDmkbX6-XBaQNfKeKjpw
```

## Usage

Once installed, you can view bookmarks by navigating to the "Bookmarks" tab in the entity page of your Backstage application.

Note that only certain pages can be bookmarked. Due to cross-origin policy, you can only bookmark pages that allow embedding in an iframe. This means that some websites may not be viewable directly within Backstage.
