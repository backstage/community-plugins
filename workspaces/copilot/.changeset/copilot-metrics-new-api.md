---
'@backstage-community/plugin-copilot-backend': minor
'@backstage-community/plugin-copilot-common': patch
---

**BREAKING**: Migrated GitHub Copilot metrics fetching to the new report-based API endpoints (`/copilot/metrics/reports/enterprise-28-day/latest` and `/orgs/.../copilot/metrics/reports/organization-28-day/latest`) using API version `2026-03-10`. The previous per-team metrics endpoints (`fetchEnterpriseTeamCopilotMetrics`, `fetchOrganizationTeamCopilotMetrics`) have been removed as they are no longer supported by the new API.

Added new types to `copilot-common` to represent the new response structure: `CopilotOrgDayTotal`, `CopilotOrgReportFile`, `CopilotIdeBreakdown`, `CopilotFeatureBreakdown`, `CopilotLanguageFeatureBreakdown`, `CopilotLanguageModelBreakdown`, and `CopilotModelFeatureBreakdown`.
