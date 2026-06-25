---
'@backstage-community/plugin-github-issues': patch
---

Fixed the GitHub Issues card crashing with `TypeError: Failed to construct 'URL': Invalid URL` for `Group` and `User` entities whose `backstage.io/source-location` / `backstage.io/managed-by-location` is not a parseable URL (for example entities registered from a `file:` location, or with no location at all).

For owner entities (`Group`/`User`) the card now resolves the GitHub host from the configured `integrations.github` instead of the owner entity's location annotation — the same approach used by the `github-pull-requests-board` plugin — so a team simply sees the open issues of every repository it owns. `getHostnameFromEntity` is now non-throwing, and repositories whose host cannot be determined are no longer silently dropped.
