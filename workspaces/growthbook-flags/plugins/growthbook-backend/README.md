# @backstage-community/plugin-growthbook-backend

Backend plugin for GrowthBook feature flags integration.

## Features

- Proxies GrowthBook management API (`/api/v1/features`, `/api/v1/projects`)
- Client-side project filtering (GrowthBook API doesn't support `?project=` param)
- 60-second flag cache per environment
- 5-minute project cache
- Falls back to SDK API if `secretKey` is not configured

## Installation

```bash
yarn workspace backend add @backstage-community/plugin-growthbook-backend
```

## Setup

Add to `packages/backend/src/index.ts`:

```typescript
backend.add(import('@backstage-community/plugin-growthbook-backend'));
```

## Configuration

Add to `app-config.yaml`:

```yaml
growthbook:
  baseUrl: ${GROWTHBOOK_BASE_URL}
  secretKey: ${GROWTHBOOK_SECRET_KEY} # Optional: for management API (enables project filtering)
  sdkKeys:
    prod: ${GROWTHBOOK_SDK_KEY_PROD}
    dev: ${GROWTHBOOK_SDK_KEY_DEV}
```

### Environment Variables

- `GROWTHBOOK_BASE_URL` - Base URL of your GrowthBook instance (e.g., `https://growthbook.example.com`)
- `GROWTHBOOK_SECRET_KEY` - Secret API key for management API (starts with `secret_`)
- `GROWTHBOOK_SDK_KEY_PROD` - SDK key for production environment (starts with `sdk_`)
- `GROWTHBOOK_SDK_KEY_DEV` - SDK key for development environment (optional)

## API Endpoints

The plugin exposes the following endpoints:

- `GET /api/backstage-community-growthbook/flags?env=<env>&project=<project>`

  - Returns feature flags for the specified environment
  - Optional `project` param to filter by GrowthBook project name

- `GET /api/backstage-community-growthbook/projects`
  - Returns list of GrowthBook project names (requires `secretKey`)

## How It Works

1. **With `secretKey` configured:**

   - Uses GrowthBook management API (`/api/v1/features`)
   - Fetches project metadata (`/api/v1/projects`)
   - Enables project-based filtering
   - Returns accurate `valueType` from API

2. **Without `secretKey` (fallback):**
   - Uses GrowthBook SDK endpoint (`/api/features/<sdkKey>`)
   - No project filtering available
   - Type detection is heuristic-based

## Caching

- **Flag cache:** 60 seconds per SDK key/environment
- **Project cache:** 5 minutes
- **Raw features cache:** 60 seconds (shared across requests)

## License

Apache-2.0

## Author

Zaki Hanafiah <zaki@zakhov.com>
