---
'@backstage-community/plugin-newrelic-dashboard': major
'@backstage-community/plugin-newrelic-dashboard-backend': major
---

Added dedicated backend plugin for New Relic Dashboard that handles NerdGraph API calls and PDF snapshot proxying server-side, removing the dependency on the Backstage proxy. Dashboard snapshots are fetched as PDFs by the backend and rendered to PNG client-side via pdfjs-dist.
