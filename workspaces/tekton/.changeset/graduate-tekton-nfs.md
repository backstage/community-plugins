---
'@backstage-community/plugin-tekton': major
---

**Breaking:** The new frontend system (NFS) plugin is now the default export. The `/alpha` subpath no longer exports the NFS plugin — it now re-exports only translations. Legacy frontend system APIs moved to `/legacy`.

**If you use the new frontend system**, import the plugin from the package root instead of `/alpha`.

**If you use the legacy frontend system**, update imports of `TektonCI`, `tektonPlugin`, and `isTektonCIAvailable` to the `/legacy` subpath.

**If you use RHDH / dynamic plugins (scalprum)**, the `TektonCI` component and `tektonTranslations` resource are now exposed under the `Legacy` module.

Translations are now available from `/translations` and `/alpha`.
