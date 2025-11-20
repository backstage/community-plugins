---
'@backstage-community/plugin-grafana': patch
---

- Update devDependencies:
  - node-gyp ^9.0.0 -> ^12.1.0
  - prettier ^2.3.2 -> ^3.6.2
- Update dependencies:
  - jsep ^1.3.8 -> ^1.4.0
- Remove unused devDependencies from grafana plugin:
  - @testing-library/user-event
  - @backstage/core-app-api
  - @testing-library/dom
  - msw
- Regenerate yarn.lock
