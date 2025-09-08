# DefectDojo Backend Plugin

This backend plugin provides DefectDojo integration for Backstage, allowing you to retrieve security findings from a DefectDojo instance.

## Installation

1. Install the plugin in your Backstage application:
   @backstage-community/plugin-defectdojo-backend

```bash
# From the root of your Backstage application
yarn add --cwd packages/backend @backstage-community/plugin-defectdojo-backend
```

2. Add the plugin to your backend in `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins

// DefectDojo plugin
backend.add(import('@backstage-community/plugin-defectdojo-backend'));

backend.start();
```

## Configuration

Add DefectDojo configuration to your `app-config.yaml`:

```yaml
defectdojo:
  baseUrl: https://your-defectdojo-instance.com
  token: ${DEFECTDOJO_TOKEN} # DefectDojo API token
  requestTimeoutMs: 30000 # Optional: timeout in milliseconds (default: 20000)
  maxPages: 100 # Optional: maximum number of pages to retrieve (default: 100)
```

## API Endpoints

### GET /api/defectdojo/health

Health endpoint that verifies if the plugin is working.

**Response:**

```json
{
  "status": "ok"
}
```

### GET /api/defectdojo/v1/findings?productId={id}

Retrieves security findings for a specific product.

**Parameters:**

- `productId` (query, required): Product ID in DefectDojo

**Response:**

```json
{
  "total": 5,
  "findings": [
    {
      "id": 123,
      "title": "SQL Injection vulnerability",
      "severity": "High",
      "url": "https://defectdojo.com/finding/123",
      "description": "Description of the vulnerability",
      "cwe": 89,
      "product": "Product Name",
      "engagement": "Engagement Name"
    }
  ],
  "tookMs": 1250
}
```

**Status Codes:**

- `200`: Success
- `400`: Invalid parameters
- `404`: Product not found
- `500`: Internal server error
- `504`: DefectDojo timeout

## Development

### Run in development mode

```bash
yarn start
```

### Run tests

```bash
yarn test
```

### Linting

```bash
yarn lint
```

## Features

- ✅ Complete integration with DefectDojo v2 API
- ✅ Robust error handling and timeouts
- ✅ Automatic pagination for large datasets
- ✅ Detailed logging for debugging
- ✅ Flexible configuration
- ✅ Unit tests
- ✅ Complete TypeScript typing

## Troubleshooting

### DefectDojo connection error

Verify that:

1. The DefectDojo base URL is correct
2. The API token is valid and has sufficient permissions
3. DefectDojo is accessible from your Backstage instance

### Timeouts

If you experience timeouts, you can increase `requestTimeoutMs` in the configuration or reduce `maxPages` to limit the amount of data retrieved.

### Pagination issues

The plugin automatically handles DefectDojo pagination. If there are infinite loops, verify that your DefectDojo instance is configured correctly.
