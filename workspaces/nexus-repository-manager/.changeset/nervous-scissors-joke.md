---
'@backstage-community/plugin-nexus-repository-manager': patch
---

Fix the artifact table's "Modified" column to sort chronologically and search by the displayed date, instead of sorting/searching the raw unformatted value. Also fixed column sorting so clicking any other column (e.g. Size, Checksum) for the first time sorts ascending, rather than inheriting the Modified column's descending order.
