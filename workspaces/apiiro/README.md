# Apiiro Integration for Backstage

This repository contains the Apiiro plugin integration for Backstage, enabling proactive application risk management for developers and security teams directly within the Backstage developer portal.

## Overview

The Apiiro plugin empowers developers to code securely by automatically checking for security vulnerabilities. Developers can review and address newly introduced vulnerabilities by Apiiro directly in Backstage, reducing overall application security risk and delivering more secure applications.

## Features

- **Dashboard View**: Repository list with comprehensive statistics from Apiiro
- **Apiiro Tab**: Detailed risk metrics and security insights for each repository
- **Apiiro Widget**: Embeddable widget for custom entity tabs
- **Permission Control**: Fine-grained access control for Apiiro metrics view on Apiiro Tab and Apiiro Widget

## Plugin Compatibility

The plugin has been successfully tested with **Backstage v1.44.0**. If you are using a newer version of Backstage, please file an issue for guidance on integration practices for your specific version.

## Quick Start

### Installation

```sh
# Install dependencies
yarn install

# Start the development server
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Plugin Components

This repository contains the following plugin packages:

1. **[@backstage-community/plugin-apiiro](./plugins/apiiro)** - Frontend plugin providing the Apiiro dashboard, tab, widget, and sidebar integrations in Backstage
2. **[@backstage-community/plugin-apiiro-backend](./plugins/apiiro-backend)** - Backend plugin that integrates with the Apiiro platform and exposes APIs for the frontend
3. **[@backstage-community/plugin-apiiro-common](./plugins/apiiro-common)** - Shared constants (annotations, defaults) used by both frontend and backend plugins
4. **[@backstage-community/plugin-catalog-backend-module-apiiro-entity-processor](./plugins/catalog-backend-module-apiiro-entity-processor)** - Catalog backend module that automatically derives and adds Apiiro annotations to entities based on their source location

## Prerequisites

- Node.js (v18 or higher recommended)
- Yarn package manager
- Apiiro Access Token with at least read permissions

## Configuration

### 1. Configure Access Token

Add your Apiiro Access Token to `app-config.local.yaml`:

```yaml
apiiro:
  accessToken: ${APIIRO_TOKEN}
  defaultAllowMetricsView: true
```

Where:

- `accessToken` is your Apiiro Access Token
- `defaultAllowMetricsView` is a boolean value that controls whether the Metrics view appears in the Apiiro Tab and Apiiro Widget by default. If annotation is not set, this value will be used. Default value is `true`.

**How to Retrieve an Access Token from Apiiro:**

1. Log in to your Apiiro instance
2. Go to Settings → Access Token
3. Create a new Access Token with a long expiration period (1 year) and grant at least read permissions
4. Generate and securely save the token

### 2. Optional: Configure Permissions

To restrict access to Apiiro metrics for specific entities:

```yaml
apiiro:
  accessToken: ${APIIRO_TOKEN}
  defaultAllowMetricsView: true
  permissionControl:
    entityNames:
      - component:<namespace>/<entity-name>
    exclude: true # true = blocklist mode, false = allowlist mode
```

See the [backend plugin documentation](./plugins/apiiro-backend/README.md#automatically-adding-apiiro-annotations-optional) for detailed permission setup instructions.

## Documentation

- **[Frontend Plugin](./plugins/apiiro/README.md)** - Installation and usage guide for the frontend plugin
- **[Backend Plugin](./plugins/apiiro-backend/README.md)** - Backend setup and permission configuration
- **[Common Package](./plugins/apiiro-common/README.md)** - Shared constants and configuration defaults
- **[Catalog Backend Module - Apiiro Entity Processor](./plugins/catalog-backend-module-apiiro-entity-processor/README.md)** - Catalog backend module for automatically adding Apiiro annotations to entities

## Project Structure

```
apiiro-backstage/
├── plugins/
│   ├── apiiro/              # Frontend plugin
│   ├── apiiro-backend/      # Backend plugin
│   ├── apiiro-common/       # Common package
│   └── catalog-backend-module-apiiro-entity-processor/  # Catalog backend module for Apiiro annotations
├── app-config.local.sample  # Sample development configuration
├── app-config.yaml          # Development configuration
└── app-config.production.yaml  # Production configuration
```

## Support

For issues, questions, or contributions:

- File an issue in this repository
- Refer to the [Backstage documentation](https://backstage.io/docs)
- Check individual plugin READMEs for specific guidance

## License

Apache-2.0

---

Built with [Backstage](https://backstage.io) - The open platform for building developer portals
