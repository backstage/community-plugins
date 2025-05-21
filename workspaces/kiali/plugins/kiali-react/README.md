# @backstage/plugin-kiali-react

> Shared web components for the Kiali plugin in Backstage

This package provides a reusable set of UI components, utilities, and hooks designed to support the development of the [Kiali plugin for Backstage](https://github.com/backstage/community-plugins/blob/main/workspaces/kiali). It aims to keep the plugin codebase clean and modular, while enabling faster iteration and better maintainability.

## ✨ Features

- Reusable UI components tailored to Kiali data and workflows
- Shared logic for interfacing with Istio/Kiali APIs
- Designed to integrate seamlessly within Backstage plugins
- Focused on developer experience and visual consistency

## 🧱 Usage

Import and use the shared components within your Kiali Backstage plugin:

```tsx
import { TrafficGraph } from '@backstage/plugin-kiali-react';

<TrafficGraph model={} />;
```

📁 Project Structure

``bash
src/
├── components/ # Shared React components
├── hooks/ # Reusable custom hooks
└── utils/ # Utility functions

```


🤝 Contributing
Contributions, issues, and feature requests are welcome! Please open a PR or issue in the main plugin repo if it relates to this shared library.
```
