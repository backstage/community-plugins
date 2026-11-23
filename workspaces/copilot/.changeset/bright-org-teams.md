---
'@backstage-community/plugin-copilot': minor
'@backstage-community/plugin-copilot-backend': minor
---

Add opt-in multi-organization Copilot reporting through
`copilot.ingestOrganizationTeamReports`. In enterprise dashboards, organization
teams can be filtered by organization and team; options use the selected date
range and remain available with partial report coverage. Organization-team
metrics preserve the five-user privacy threshold and leave unreported days
blank. Enterprise totals continue to fill missing days when all organizations
are selected. Selecting a team scopes results to its owning organization,
keeping same-slug teams distinct.
Failed organization-team option and dashboard requests can be retried.
Monthly active-user metrics display as unavailable when GitHub does not report
them. Team weekly active-user charts leave unreported values blank.
