# MeeWee Time Registration Plugin

This plugin is contributed by [Dewise](https://www.dewise.com/)

## Features

The MeeWee Time Registration plugin enables users to register their time to MeeWee directly from the Backstage application:
1. Login using MeeWee account.
2. Redirect to the signup site.
3. Register time to your MeeWee account.
4. View all registered time by dates.

## Setup

Follow these steps to set up the MeeWee plugin:

1. Install the plugin by running this command from your Backstage root directory:

```bash
yarn --cwd packages/app add @backstage-community/plugin-meewee-time-registration
```

2. Import the component from `@backstage-community/backstage-plugin-meewee-time-registration`.
```tsx
import { MeeweeTimeRegistrationPage } from '@backstage-community/backstage-plugin-meewee-time-registration';
```

3. Call the component inside the location where you want to place the plugin:
```tsx
<Grid item xs={12} md={6}>
    <MeeweeTimeRegistrationPage />
</Grid>
```

