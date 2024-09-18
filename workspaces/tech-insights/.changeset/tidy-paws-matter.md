---
'@backstage-community/plugin-tech-insights-backend': major
---

**BREAKING**: The service no longer accepts the deprecated `TokenManager` instance, but instead the `AuthService` is now required where it used to be optional. If you are using the new backend system module, this does not affect you.
