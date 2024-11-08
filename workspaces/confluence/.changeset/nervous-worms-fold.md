---
'@backstage-community/plugin-search-backend-module-confluence-collator': patch
---

Make `parallelismLimit` configuration field optional.

This field is already treated as optional in the package code, and the default
value is already mentioned in the description. As such we can safely mark it as
optional and treat configuration which omits it as valid.
