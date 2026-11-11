---
'@backstage-community/plugin-shortcuts': patch
---

Added support for the new frontend system. Install the plugin from `@backstage-community/plugin-shortcuts/alpha` and it adds the shortcuts to the app's navigation by itself, with no app code. Use the `nav-element:shortcuts` extension config to allow external links, move it before the page links, or turn it off. The existing exports for the old frontend system are unchanged.
