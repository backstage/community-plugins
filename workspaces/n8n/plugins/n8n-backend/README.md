# n8n Backend Plugin

Website: [https://n8n.io/](https://n8n.io/)

This is the backend half of the n8n plugin and is responsible for:

- Connecting to your n8n instance via its REST API
- Proxying workflow and execution data to the frontend plugin
- Managing workflow activation and deactivation

## Setup

1. Install the plugin:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-n8n-backend
```

2. Add the plugin to your backend in `packages/backend/src/index.ts`:

```diff
  import { createBackend } from '@backstage/backend-defaults';
  const backend = createBackend();
  // ... other feature additions
+ backend.add(import('@backstage-community/plugin-n8n-backend'));
  backend.start();
```

3. Configure the n8n connection in your `app-config.yaml`:

```yaml
n8n:
  baseUrl: https://your-n8n-instance.com
  apiKey: ${N8N_API_KEY}
```

| Config Key    | Description                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| `n8n.baseUrl` | Base URL of your n8n instance                                                                               |
| `n8n.apiKey`  | API key for authenticating with the n8n REST API. Generate one from your n8n instance under Settings > API. |

The `apiKey` should be provided via an environment variable for security.

## API Endpoints

The backend plugin exposes the following endpoints:

| Method | Path                                        | Description           |
| ------ | ------------------------------------------- | --------------------- |
| GET    | `/api/n8n/health`                           | Health check          |
| GET    | `/api/n8n/workflows`                        | List all workflows    |
| GET    | `/api/n8n/workflows/:workflowId`            | Get workflow details  |
| GET    | `/api/n8n/workflows/:workflowId/executions` | Get execution history |
| POST   | `/api/n8n/workflows/:workflowId/activate`   | Activate a workflow   |
| POST   | `/api/n8n/workflows/:workflowId/deactivate` | Deactivate a workflow |

## n8n API Key

To generate an API key in n8n:

1. Open your n8n instance
2. Go to **Settings** > **API**
3. Click **Create an API key**
4. Copy the generated key and set it as the `N8N_API_KEY` environment variable
