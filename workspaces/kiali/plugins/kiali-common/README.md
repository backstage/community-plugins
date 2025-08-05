# Kiali Backstage Plugin – Common Library @@backstage-community/plugin-kiali-common)

This package contains shared utilities, types, and constants for the [Kiali Backstage Plugin](https://github.com/backstage/community-plugins/tree/main/workspaces/kiali), used by both the frontend and backend components of the plugin. It serves as a single source of truth for:

- Shared TypeScript types/interfaces
- Constants such as annotation labels and plugin names

---

## ✨ Features

- ✅ Centralized types for consistent communication between frontend and backend
- ✅ Constants for annotations and plugin metadata

---

## 📦 Installation

```bash
npm install @backstage-community/plugin-kiali-common
# or
yarn add @backstage-community/plugin-kiali-common

Welcome to the common package for the kiali plugin!
```

# 📁 Structure

.
├── src/
│ ├── index.ts  
│ ├── constants.ts # Plugin-wide constants  
│ └── types/ # Shared TypeScript types
│  
└── README.md

# 📚 Usage

## Importing types

```ts
import type { Namespace } from '@backstage-community/plugin-kiali-common/types';
```

## Importing functions

```ts
import { namespaceFromString } from '@backstage-community/plugin-kiali-common/func';
```

## Importing utils

```ts
import { getRefreshIntervalName } from '@backstage-community/plugin-kiali-common/utils';
```

## Importing config

```ts
import { defaultServerConfig } from '@backstage-community/plugin-kiali-common/config';
```

## Using constants

```ts
import { KIALI_PROVIDER } from '@backstage-community/plugin-kiali-common';
```

# 🔧 Development

When making changes to types or constants in this package, ensure compatibility across both frontend and backend plugin implementations. This package is versioned independently to prevent breaking changes downstream.

# 🚀 Publishing

This package is typically published as part of the overall Kiali Backstage Plugin release process automatically after push.
