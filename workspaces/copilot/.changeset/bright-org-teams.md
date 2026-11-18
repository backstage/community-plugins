---
'@backstage-community/plugin-copilot': minor
'@backstage-community/plugin-copilot-backend': minor
---

Add opt-in multi-organization Copilot reporting through
`copilot.ingestOrganizationTeamReports`. In enterprise dashboards, organization
teams can be filtered by organization and team; options use the selected date
range and remain available with partial report coverage. Metrics preserve the
five-user privacy threshold and leave unreported days blank. Selecting a team
scopes results to its owning organization, keeping same-slug teams distinct.
Failed team-option and dashboard requests can be retried.
