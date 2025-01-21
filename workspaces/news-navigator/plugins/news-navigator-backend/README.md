# Backstage Plugin News Navigator (Backend Setup)

This is the backend plugin for the News Navigator plugin. It provides the necessary APIs to fetch news articles from the News API.

1. Add the backend plugin package:

```bash
yarn workspace backend add @backstage-community/plugin-news-navigator-backend
```

2. Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@backstage-community/plugin-news-navigator-backend'));
```

3. Add the necessary configuration to your `app-config.yml`:

```yaml
newsAPI:
  # Create a new API key at https://newsapi.org/ and set it as the value for NEWS_API_KEY
  apiKey: ${NEWS_API_KEY}
```
