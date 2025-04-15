---
'@backstage-community/plugin-acs': patch
---

This patch fixed local runs of the acs plugin by adding/updating the required resolution in the package.json file. This also fixes a bug where the backend url doesn't get set which causes the query to the ACS API to fail.
