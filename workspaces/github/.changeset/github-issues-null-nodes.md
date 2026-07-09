---
'@backstage-community/plugin-github-issues': patch
---

Fixed the GitHub Issues card failing with `Cannot read properties of null (reading 'updatedAt')` / repeated "Resource limits for this query exceeded." errors on entities (typically groups) that own many repositories.

- Repositories are now fetched in smaller batches instead of a single large GraphQL query, which was exceeding GitHub's per-request resource limit and causing GitHub to return `null` issue nodes.
- Trimmed the issues query to only what the UI renders: `assignees` is fetched with `first: 1` (only the first assignee is displayed) and the unused `participants` field was removed. Both were nested fields contributing to the resource-limit failures.
- Null issue nodes returned in partial responses are now filtered out before sorting/rendering, so a partial failure no longer crashes the card.
