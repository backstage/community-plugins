---
'@backstage-community/plugin-topology': minor
---

Added support for the New Frontend System (NFS), including alpha exports with `EntityContentBlueprint` and `TranslationBlueprint`, plus dedicated dev entrypoints for backend and mock modes. Added explicit mock-only dev entry files for both legacy and NFS flows (`dev/index.mock.tsx` and `dev/alpha/index.mock.tsx`) so local development and e2e can run without backend dependencies. Removed packages/app and packages/backend to eliminate the need for a full Backstage app setup, and introduced a lightweight Topology backend that imports and relies on the Kubernetes backend plugin for real data integration when using backend mode.
