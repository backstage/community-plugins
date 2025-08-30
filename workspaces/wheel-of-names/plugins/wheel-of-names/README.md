# Wheel of Names

Welcome to the Wheel of Names plugin for Backstage!

This plugin provides a customizable spinning wheel that can be used for random selection, decision making, or just for fun in your Backstage instance.

## Features

- Create a spinning wheel with users and groups from the Backstage catalog
- Randomly select a winner from the wheel

## Installation

To install this plugin in your Backstage application:

```bash
# From your Backstage root directory
yarn --cwd packages/app add @backstage-community/plugin-wheel-of-names
```

## Configuration

1. Add the plugin to your Backstage application:

```tsx
// packages/app/src/App.tsx
import { WheelOfNamesPage } from '@backstage-community/plugin-wheel-of-names';

// ...

<Route path="/wheel-of-names" element={<WheelOfNamesPage />} />;
```

2. Add a link to the sidebar:

```tsx
// packages/app/src/components/Root/Root.tsx
import RouletteIcon from '@material-ui/icons/Casino'; // or any other suitable icon

// ...

<SidebarItem icon={RouletteIcon} to="wheel-of-names" text="Wheel of Names" />;
```

## Development

This plugin was created through the Backstage CLI.

You can access it by running `yarn start` in the root directory, and then navigating to [/wheel-of-names](http://localhost:3000/wheel-of-names).

To serve the plugin in isolation, run `yarn start` in the plugin directory. This provides quicker iteration speed, faster startup, and hot reloads. This setup is only meant for local development and can be found in the [/dev](./dev) directory.
