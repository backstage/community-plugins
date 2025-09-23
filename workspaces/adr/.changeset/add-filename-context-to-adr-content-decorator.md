---
'@backstage-community/plugin-adr': minor
---

feat: add filename context to AdrContentDecorator

Enhanced the `AdrContentDecorator` interface to include an optional `filename` parameter, enabling decorators to access the ADR filename for more content transformations.

**Breaking Changes**: None - the `filename` parameter is optional and maintains full backward compatibility.
