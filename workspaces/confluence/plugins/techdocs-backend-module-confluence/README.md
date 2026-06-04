# TechDocs Confluence Backend Module

This plugin provides a TechDocs preparer that fetches documentation from Confluence pages and converts them to Markdown for rendering in Backstage TechDocs.

## Features

- **Automatic HTML to Markdown conversion** - Converts Confluence page content to MkDocs-compatible Markdown
- **Page tree support** - Recursively fetches child pages to build a complete documentation hierarchy
- **Attachment handling** - Downloads and embeds images and draw.io diagrams
- **Multiple URL formats** - Supports Confluence Cloud and Server/Data Center URL patterns
- **Multiple Confluence instances** - Connect to multiple Confluence instances and automatically route URLs to the correct one
- **Hybrid preparer** - Transparently handles both Confluence URLs and standard TechDocs URLs

## Installation

Add the module package as a dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-techdocs-backend-module-confluence
```

In your `packages/backend/src/index.ts`, add the module to your backend instance:

```tsx
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-techdocs-backend'));
backend.add(
  import('@backstage-community/plugin-techdocs-backend-module-confluence'),
);
backend.start();
```

## Configuration

This module uses the shared `confluence` configuration section. See the [`@backstage-community/plugin-search-backend-module-confluence-collator`](https://github.com/backstage/community-plugins/tree/main/workspaces/confluence/plugins/search-backend-module-confluence-collator#configuration) README for full configuration details including authentication methods and multiple instance support.

### Page Tree Options

You can customize how the module fetches hierarchical page structures:

```yaml
confluence:
  # ...
  pageTree:
    parallel: true # Enable parallel fetching of child pages (default: true)
    maxDepth: 5 # Maximum depth to traverse (default: 0 = unlimited)
```

### Multiple Confluence Instances

When multiple instances are configured (see the [collator README](https://github.com/backstage/community-plugins/tree/main/workspaces/confluence/plugins/search-backend-module-confluence-collator#multiple-instances)), this module automatically routes TechDocs requests to the correct instance by matching the hostname in the entity's `backstage.io/techdocs-ref` URL against each instance's `baseUrl`.

## Usage

### Configuring Entities

To use Confluence as a TechDocs source, add the `backstage.io/techdocs-ref` annotation to your entity:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    backstage.io/techdocs-ref: url:https://<your-domain>.atlassian.net/wiki/spaces/DOCS/pages/123456789/My+Service+Docs
spec:
  type: service
  owner: my-team
```

> **Important:** The hostname in the annotation URL must match the `baseUrl` configured for your Confluence instance. If you are using scoped or service account tokens with the `api.atlassian.com` endpoint, use that URL format in the annotation instead:
>
> ```yaml
> backstage.io/techdocs-ref: url:https://api.atlassian.com/ex/confluence/<your-cloud-id>/wiki/spaces/DOCS/pages/123456789/My+Service+Docs
> ```

### Supported URL Formats

The module supports multiple Confluence URL patterns:

**Confluence Cloud (classic token):**

```text
https://<your-domain>.atlassian.net/wiki/spaces/{SPACE}/pages/{pageId}/{page-title}
```

**Confluence Cloud (scoped / service account token):**

```text
https://api.atlassian.com/ex/confluence/<your-cloud-id>/wiki/spaces/{SPACE}/pages/{pageId}/{page-title}
```

**Confluence Server/Data Center (display format):**

```text
https://<your-confluence-host>/display/{SPACE}/{Page+Title}
```

**Direct page ID:**

```text
https://<your-confluence-host>/pages/viewpage.action?pageId=123456789
```

### Alternative Annotation Format

You can also use the explicit `confluence-url:` prefix:

```yaml
metadata:
  annotations:
    backstage.io/techdocs-ref: confluence-url:https://<your-domain>.atlassian.net/wiki/spaces/DOCS/pages/123456789/Docs
```

## How It Works

1. When TechDocs builds documentation for an entity with a Confluence URL, this module intercepts the request
2. It fetches the Confluence page and all its child pages recursively
3. HTML content is converted to Markdown using `node-html-markdown`
4. Attachments (images, draw.io diagrams) are downloaded and embedded
5. An `mkdocs.yml` configuration is generated with proper navigation
6. The prepared documentation is passed to TechDocs for building

## Combining with Search Collator

This module works well alongside the [`@backstage-community/plugin-search-backend-module-confluence-collator`](https://github.com/backstage/community-plugins/tree/main/workspaces/confluence/plugins/search-backend-module-confluence-collator) which indexes Confluence documents for search. Both modules share the same `confluence` configuration section.
