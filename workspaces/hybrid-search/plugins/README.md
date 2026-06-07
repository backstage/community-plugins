# Hybrid Search Plugins & Modules

This directory contains the plugins and backend modules that implement the decoupled hybrid search architecture for Backstage.

Together, these modules allow routing search queries in parallel to specialized backends (such as Vertex AI Search for semantic documentation, or Typesense for software catalog indexing) and interleaving the results.

## 📦 Available Plugins & Modules

| Plugin / Module                    | Directory                                                                              | Purpose                                                                                                                                                  |
| :--------------------------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hybrid Search Router**           | [`search-backend-module-hybrid`](./search-backend-module-hybrid/README.md)             | **Dynamic Orchestrator**: Registers sub-engines through its registry extension point, delegates incoming search queries, and interleaves search results. |
| **Vertex AI Search Sub-Engine**    | [`search-backend-module-vertexai`](./search-backend-module-vertexai/README.md)         | **Semantic Search**: Sub-engine that translates Backstage search queries to Google Discovery Engine API calls, and sweeps/purges orphaned documents.     |
| **Typesense Search Sub-Engine**    | [`search-backend-module-typesense`](./search-backend-module-typesense/README.md)       | **Catalog Search**: Sub-engine that indexes and searches standard Backstage catalog entities (API, component, resource, template).                       |
| **GCS Eventarc Ingestion Webhook** | [`events-backend-module-gcs-eventarc`](./events-backend-module-gcs-eventarc/README.md) | **Cloud-Native Ingestion**: Receives bucket upload alerts from Google Eventarc to trigger document parsing and ingestion into Vertex AI Search.          |
