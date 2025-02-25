# Backstage Plugin News Navigator (Frontend Setup)

This is the frontend plugin for the News Navigator plugin. It provides the necessary UI to fetch news articles from the News API.

1. Install the plugin in your environment

```bash
yarn workspace app add @backstage-community/plugin-news-navigator
```

2. Add configuration to app-config.yml

```yaml
newsAPI:
  # Create a new API key at https://newsapi.org/ and set it as the value for NEWS_API_KEY
  apiKey: ${NEWS_API_KEY}
```

3. Modify your app routes in `packages/app/src/App.tsx`:

```diff
+ import { NewsNavigatorPage } from '@internal/backstage-plugin-news-navigator';

const routes = (

  <FlatRoutes>
    ...
+   <Route path="/news-navigator" element={<NewsNavigatorPage />} />
    ...
  </FlatRoutes>
);

```

4. Add **News Navigator icon to the Sidebar**. In `packages/app/src/components/Root/Root.tsx` add:

```diff
+ import DescriptionIcon from '@material-ui/icons/Description';

  <SidebarGroup label="Menu" icon={<MenuIcon />}>
    ...
+   <SidebarItem icon={DescriptionIcon} to="news-navigator" text="News Navigator" />
    ...
  </SideGroup>
```
