# Typesense Search Backend Module for Backstage (`@backstage-community/plugin-search-backend-module-typesense`)

This backend module integrates Typesense search capabilities into the Backstage Search system. It registers itself to the `@backstage-community/plugin-search-backend-module-hybrid` router to handle specific categories (like `software-catalog` and others).

---

## 🏛️ Features

* **Typesense Search Engine**: Translates Backstage search queries into high-performance Typesense document searches.
* **Auto-Dynamic Schemas**: Automatically constructs dynamic schema definitions in Typesense on collection creation.
* **Batch Ingestion Stream**: Implements a high-performance Writable batch-stream loader for indexing documents with action-upserts.
* **Configurable Passthroughs**: Supports raw client options and custom schemas for vector/semantic searches.

---

## ⚙️ Configuration

Add the typesense search engine configuration to your `app-config.yaml`:

```yaml
search:
  engines:
    typesense:
      apiKey: ${typesenseApiKey}
      nodes:
        - host: localhost
          port: 8108
          protocol: http
      # Additional raw options passed straight to the Typesense Client
      clientOptions:
        connectionTimeoutSeconds: 5
        numRetries: 3
        logLevel: info
      # Customizable schemas and query parameters
      collections:
        software-catalog:
          fields:
            - name: ".*"
              type: "auto"
            - name: "embedding"
              type: "float[]"
              num_dim: 384
              model_config:
                model_name: "ts/all-MiniLM-L6-v2"
          searchOptions:
            query_by: "title,text,location,embedding"
```
