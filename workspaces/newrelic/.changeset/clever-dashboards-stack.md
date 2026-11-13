---
'@backstage-community/plugin-newrelic-dashboard': minor
---

The `newrelic.com/dashboard-guid` annotation now accepts a comma-separated list of dashboard GUIDs, for example `'guid1, guid2'`. Each dashboard is shown in its own section, in the order listed. Whitespace around each GUID is trimmed, and empty and repeated entries are ignored. A single GUID works as before.
