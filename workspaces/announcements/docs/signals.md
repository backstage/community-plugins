# Support for signals

The announcements plugin supports delivering announcements to the frontend in near real-time using the [@backstage/plugins-signals](https://github.com/backstage/backstage/tree/master/plugins/signals) plugin. This is currently supported in the `<NewAnnouncementBanner />` [component](./latest-announcement-banner.md).

## Installation

> [!IMPORTANT]
> This feature requires the `@backstage/plugin-events-backend` plugin to be installed and running.

```ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/events-backend'));
...
backend.add(import('@backstage/signals-backend'));
backend.add(import('@backstage-community/plugin-announcements-backend'));

backend.start();
```
