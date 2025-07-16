# ServiceNow Frontend Plugin

This is the frontend implementation of the ServiceNow plugin for Backstage.

It is responsible for rendering the ServiceNow tab content, fetching incident data, and integrating with Backstage's dynamic plugin system.

---

## 🚀 Getting Started

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Start the Backstage dev app:

Your plugin has been added to the example app in this `plugins/servicenow` directory, meaning you'll be able to access it by running `yarn start` in the current directory, and then navigating to [/servicenow](http://localhost:3000/servicenow).

## Frontend Configuration

This plugin supports dynamic mounting via `dynamic-plugins.yaml`.
Please refer to the main plugin [README](../README.md) for complete instructions on:

- Adding dynamic mount points
- Configuring tabs
- Using the `isMyProfile` condition on mount point configuration

## Notes on Identity Handling

When using this plugin in a Backstage instance that supports dynamic plugins (e.g., RHDH), it enables user-specific incident filtering in the **"My ServiceNow Tickets"** tab, shown on the entity page of the currently logged-in user.

> **NOTE:** The local dev app does **not** support user-specific incident filtering.
