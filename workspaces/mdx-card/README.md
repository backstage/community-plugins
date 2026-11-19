# MDX Card

This workspace contains a plugin that renders entity page and home page cards from MDX templates, using data from Backstage backend APIs.

## Plugins

- [mdx-card](./plugins/mdx-card/README.md): Frontend plugin that provides the entity card and home page card.

## Getting Started

To start the plugin's development app using the new frontend system, run:

```sh
yarn install
yarn --cwd plugins/mdx-card start
```

The app runs without a backend. When signing in as a guest, accept the prompt to use the legacy guest token. The MDX card is on the example-service entity page and on the home page.

To start the development app using the legacy frontend system, run `yarn --cwd plugins/mdx-card start:legacy`.
