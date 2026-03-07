# @backstage-community/plugin-growthbook-backend

## 0.1.0

### Minor Changes

- Initial release of GrowthBook backend plugin
- Proxy for GrowthBook management API (`/api/v1/features`, `/api/v1/projects`)
- Client-side project filtering (API doesn't support `?project=` query param)
- 60-second flag cache per SDK key/environment
- 5-minute project cache
- Falls back to SDK API if `secretKey` is not configured
