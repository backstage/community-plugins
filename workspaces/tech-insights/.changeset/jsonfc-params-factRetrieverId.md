---
'@backstage-community/plugin-tech-insights-backend-module-jsonfc': patch
---

Conditions can now set `params.factRetrieverId` to disambiguate between fact retrievers that publish facts under the same name. When set, the condition resolves against that retriever's value; when omitted, the existing flat-merge behaviour is preserved unchanged.
