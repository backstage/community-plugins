# Typesense Search Backend Module for Backstage (`@backstage-community/plugin-search-backend-module-typesense`)

This backend module integrates Typesense search capabilities into the Backstage Search system. It registers itself to the `@backstage-community/plugin-search-backend-module-hybrid` router to handle specific categories (like `software-catalog` and others).

---

## 🏛️ Features & Architecture Deep Dive

### 1. 🔍 Typesense Search Engine

Translates standard Backstage search queries into high-performance keyword searches in Typesense.

### 2. ⚡ Batch Ingestion Stream

During indexing, Backstage collates thousands of catalog entities and feeds them to the search engine one-by-one. Ingesting them via separate HTTP requests would slow down the indexing process.
This module implements a **buffered writable stream** to optimize this flow:

- **Memory Buffering**: As documents flow in, they are pushed into a memory array buffer instead of being sent immediately.
- **Batch Ingestion**: When the buffer reaches **100 documents**, the engine flushes the entire batch to Typesense in a **single bulk HTTP request**.
- **Safe Upsert**: Documents are imported using Typesense's `action: 'upsert'` strategy, which overwrites old entities and prevents double-indexing.
- **Final Flush**: When the indexing task finishes, any remaining documents in the buffer are flushed to ensure no documents are lost.

### 3. ⚙️ Auto-Dynamic Schemas

To eliminate the need to pre-define schemas for every Backstage document type, this module implements an **auto-provisioning wildcard schema strategy**:

- **Assertion Check**: When the indexing task starts (`getIndexer(type)`), the engine checks if a corresponding Typesense collection named `backstage_${type}` exists.
- **Auto-Creation on 404**: If the collection is missing, the engine catches the error and creates it on-the-fly.
- **Wildcard Fallback**: The collection is created with a regex wildcard field rule: `{ "name": ".*", "type": "auto" }`. This instructs Typesense to automatically analyze incoming field datatypes (strings, integers, arrays, etc.) and dynamically construct the schema as documents are ingested.

### 4. 🎛️ Configurable Passthroughs

To allow full access to Typesense's advanced capabilities (such as connection management, custom query boosting, or AI-powered vector searches) without hardcoding them, this module implements a **raw configuration passthrough pattern**:

- **Client Connection Options**: Any key-value pairs defined under `clientOptions` in `app-config.yaml` are forwarded directly to the constructor of the underlying `typesense` client library.
- **Custom Collection Schemas**: When a collection is created, you can specify custom field schemas inside the `collections` configuration block (e.g. to enable built-in vector/semantic search using `ts/all-MiniLM-L6-v2` embedding models).
- **Custom Query Options**: Any properties defined under `searchOptions` are merged directly into the query payload sent to the Typesense search endpoint (e.g. custom `query_by` fields).

---

## 🔌 Installation

First, install the package in your Backstage backend package:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-search-backend-module-typesense
```

Then, add it to your `packages/backend/src/index.ts` alongside any other plugins/modules:

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other plugins/modules ...

// Add the Typesense search engine module
backend.add(
  import('@backstage-community/plugin-search-backend-module-typesense'),
);

backend.start();
```

---

## ⚙️ Configuration

Configure the Typesense search engine settings in your `app-config.yaml`. Under the `collections` section, you can optionally define custom schema fields (e.g. for vector search embedding models):

```yaml
search:
  engines:
    typesense:
      apiKey: ${typesenseApiKey}
      nodes:
        - host: ${typesenseHost} # e.g. localhost for local development, or typesense service name in GKE/Docker
          port: ${typesensePort}
          protocol: ${typesenseProtocol}
      # Additional raw options passed straight to the Typesense Client
      clientOptions:
        connectionTimeoutSeconds: 5
        numRetries: 3
        logLevel: info
      # Customizable schemas and query parameters
      collections:
        software-catalog:
          fields:
            - name: '.*'
              type: 'auto'
            - name: 'embedding'
              type: 'float[]'
              num_dim: 384
              model_config:
                model_name: 'ts/all-MiniLM-L6-v2' # Optional vector search model config
          searchOptions:
            query_by: 'title,text,location,embedding'
```
