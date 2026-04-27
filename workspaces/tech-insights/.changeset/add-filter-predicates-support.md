---
'@backstage-community/plugin-tech-insights-node': minor
'@backstage-community/plugin-tech-insights-backend': minor
---

Added support for `FilterPredicate` from `@backstage/filter-predicates` in fact retriever entity filters. The `entityFilter` field on `FactRetriever` and `FactRetrieverContext` now accepts `FilterPredicate` expressions with logical operators (`$all`, `$any`, `$not`) and value matchers (`$in`, `$exists`, `$contains`, `$hasPrefix`) in addition to the existing legacy key-value filter format. When a `FilterPredicate` is used, entities are fetched via `queryEntities` for server-side predicate-based filtering. A new `EntityFilter` union type and re-exported `FilterPredicate` type are available from the node package.
