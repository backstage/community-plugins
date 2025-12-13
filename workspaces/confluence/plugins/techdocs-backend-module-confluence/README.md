# TechDocs Confluence Backend Module

This plugin provides a TechDocs preparer that fetches documentation from Confluence pages and converts them to Markdown for rendering in Backstage TechDocs.

## Features

- **Automatic HTML to Markdown conversion** - Converts Confluence page content to MkDocs-compatible Markdown
- **Page tree support** - Recursively fetches child pages to build a complete documentation hierarchy
- **Attachment handling** - Downloads and embeds images and draw.io diagrams
- **Multiple URL formats** - Supports Confluence Cloud and Server/Data Center URL patterns
- **Hybrid preparer** - Transparently handles both Confluence URLs and standard TechDocs URLs

## Installation

Add the module package as a dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-techdocs-backend-module-confluence
```

### New Backend System

This backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/). In your `packages/backend/src/index.ts`, add the module to your backend instance:

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

The module uses the shared `confluence` configuration section. Add the following to your `app-config.yaml`:

```yaml
confluence:
  baseUrl: 'https://your-company.atlassian.net/wiki'
  auth:
    type: 'bearer'
    token: '${CONFLUENCE_TOKEN}'
```

### Base URL

The `baseUrl` for Confluence Cloud should include the product name which is `wiki` by default. An example `baseUrl` for Confluence Cloud would look like this: `https://example.atlassian.net/wiki`

If you are using a self-hosted Confluence instance, your `baseUrl` would look something like this: `https://confluence.example.com`

### Auth Methods

The module supports three authentication methods: `bearer`, `basic`, and `userpass`.

#### Bearer (Recommended for Confluence Cloud)

```yaml
confluence:
  baseUrl: 'https://your-company.atlassian.net/wiki'
  auth:
    type: 'bearer'
    token: '${CONFLUENCE_TOKEN}'
```

#### Basic (Email + Token)

```yaml
confluence:
  baseUrl: 'https://your-company.atlassian.net/wiki'
  auth:
    type: 'basic'
    token: '${CONFLUENCE_TOKEN}'
    email: 'example@company.org'
```

#### Userpass (Username + Password)

```yaml
confluence:
  baseUrl: 'https://confluence.example.com'
  auth:
    type: 'userpass'
    username: '${CONFLUENCE_USERNAME}'
    password: '${CONFLUENCE_PASSWORD}'
```

**Note:** For `basic` and `bearer` authentication methods you will need an access token with `Read` permissions. You can create a Personal Access Token (PAT) [in Confluence](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).

### Page Tree Options

You can customize how the module fetches hierarchical page structures:

```yaml
confluence:
  baseUrl: 'https://your-company.atlassian.net/wiki'
  auth:
    type: 'bearer'
    token: '${CONFLUENCE_TOKEN}'
  pageTree:
    # Enable parallel fetching of child pages (default: true)
    # Set to false if your Confluence API has rate limiting issues
    parallel: true
    # Maximum depth to traverse (default: 0 = unlimited)
    # Useful for limiting very deep page hierarchies
    maxDepth: 5
```

## Usage

### Configuring Entities

To use Confluence as a TechDocs source, add the `backstage.io/techdocs-ref` annotation to your entity:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    # Standard url: format - Confluence URLs are auto-detected
    backstage.io/techdocs-ref: url:https://your-company.atlassian.net/wiki/spaces/DOCS/pages/123456789/My+Service+Docs
spec:
  type: service
  owner: my-team
```

### Supported URL Formats

The module supports multiple Confluence URL patterns:

**Confluence Cloud (spaces format):**

```text
https://{org}.atlassian.net/wiki/spaces/{SPACE}/pages/{pageId}/{page-title}
```

**Confluence Server/Data Center (display format):**

```text
https://confluence.example.com/display/{SPACE}/{Page+Title}
```

**Direct page ID:**

```text
https://confluence.example.com/pages/viewpage.action?pageId=123456789
```

### Alternative Annotation Format

You can also use the explicit `confluence-url:` prefix:

```yaml
metadata:
  annotations:
    backstage.io/techdocs-ref: confluence-url:https://your-company.atlassian.net/wiki/spaces/DOCS/pages/123456789/Docs
```

## How It Works

1. When TechDocs builds documentation for an entity with a Confluence URL, this module intercepts the request
2. It fetches the Confluence page and all its child pages recursively
3. HTML content is converted to Markdown using `node-html-markdown`
4. Attachments (images, draw.io diagrams) are downloaded and embedded
5. An `mkdocs.yml` configuration is generated with proper navigation
6. The prepared documentation is passed to TechDocs for building

## Combining with Search Collator

This module works well alongside the [search-backend-module-confluence-collator](../search-backend-module-confluence-collator/README.md) which indexes Confluence documents for search. Both modules share the same `confluence` configuration section.
