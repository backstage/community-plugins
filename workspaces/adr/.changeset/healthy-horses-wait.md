---
'@backstage-community/plugin-adr-backend': patch
---

The `DefaultAdrCollatorFactory` and `AdrCollatorFactoryOptions` have been deprecated in favour of using the
new `@backstage-community/search-backend-module-adr` module.

The `search` types (`MadrParserOptions`, `createMadrParser`, `AdrParserContext`, `AdrParser`) have been moved
to `@backstage-community/search-backend-module-adr`. If you were using any of these, please import them now
from the dedicated search module package instead.

All these types are now re-exported from the new locations, ensuring no diverged types.
