# @backstage-community/plugin-todo

This plugin lists `// TODO` comments in source code. It currently exports a single component extension for use on entity pages.

## Prerequisite

For this plugin to work, you must first install and configure the [Todo Backend plugin](../todo-backend).

## Installation

From the root of your Backstage project, run the following command:

```bash
yarn --cwd packages/app add @backstage-community/plugin-todo
```

Next, integrate the plugin by adding it as a tab to the catalog entity pages where you want the Todo tab to appear. For example, to enable the tab on service entities, update your EntityPage.tsx file as follows:

```jsx
// In packages/app/src/components/catalog/EntityPage.tsx
import { EntityTodoContent } from '@backstage-community/plugin-todo';
// Adds the Todo tab to the service entity page
const serviceEntityPage = (
  <EntityLayout>
    {/* other tabs... */}
    <EntityLayout.Route path="/todo" title="Todo">
      <EntityTodoContent />
    </EntityLayout.Route>
  </EntityLayout>
);
```

## Integrating with the new Frontend System

Follow this section if you are using Backstage's [new frontend system](https://backstage.io/docs/frontend-system/).

Import `todoPlugin` in your `App.tsx` and add it to your app's `features` array:

```typescript
import todoPlugin from '@backstage-community/plugin-todo/alpha';
// ...
export const app = createApp({
  features: [
    // ...
    todoPlugin,
    // ...
  ],
});
```

## Format

The default parser uses [Leasot](https://github.com/pgilad/leasot), which supports a wide range of languages. By default it supports the `TODO` and `FIXME` tags, along with `@` prefix and author reference through with either a `(<name>)` suffix or trailing `/<name>`. For more information on how to configure the parser, see `@backstage-community/plugin-todo-backend`.

Below are some examples of formats that are supported by default:

```ts
// TODO: Ideally this would be working

// TODO(Rugvip): Not sure why this works, investigate

// @todo: This worked last Monday /Rugvip

// FIXME Nobody knows why this is here
```

Note that trailing comments are not supported, the following TODO would not be listed:

```ts
function reverse(str: string) {
  return str.reverse(); // TODO: optimize
}
```

The scanner also ignores all dot-files and directories, meaning TODOs inside of those will not be listed.

## Extensions

| name                | description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| `EntityTodoContent` | Content for an entity page, showing a table of TODO items for the given entity. |
