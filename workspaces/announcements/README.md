# Announcements plugin for Backstage

## Overview

The Announcements plugin is a frontend, backend, and common plugin that manages and displays announcements within Backstage.

This plugin provides:

- a component to display the latest announcement as a banner, if there is one
- a component to display the latest announcements, for example on a homepage
- pages to list, view, create, edit and delete announcements
- integration with the [`@backstage/plugin-search`](https://github.com/backstage/backstage/tree/master/plugins/search) plugin
- integration with the [`@backstage/plugin-permission-backend`](https://github.com/backstage/backstage/tree/master/plugins/permission-backend) plugin

## Installation

Find [installation instructions](./docs/index.md#installation) in our documentation.

## How does it look?

### Latest announcement banner

![Latest announcement banner](./docs/images/announcement_banner.png)

### Announcements card

![Announcements card](./docs/images/announcements_card.png)

### Announcements page

![Announcements page](./docs/images/announcements_page.png)

### Announcements search

![Announcements search results](./docs/images/announcements_search.png)

## License

This library is under the [MIT](LICENSE.md) license.

## Special thanks & Disclaimer

We want to thank K-Phoen for creating the announcement plugins found [here](https://github.com/K-Phoen/backstage-plugin-announcements). Their work has been invaluable in providing a foundation for our development efforts, and we are grateful for the time and effort they put into creating this plugin.

In the spirit of Procore’s values of openness, our focus will be on meeting our internal needs, meaning we are making changes to the plugin that are incompatible with the original. We are happy to share it with the community and welcome all pull requests and issues.
