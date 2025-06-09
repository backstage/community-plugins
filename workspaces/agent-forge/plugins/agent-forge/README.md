# AgentForge Backstage Frontend Plugin

This plugin is part of the AGNTCY(agntcy.org) community effort to provide the right tools & protocols for agent to agent communication.
It allows the integration of any agent supporting A2A (Agent2Agent Protocol) especially the platfrom related agents released under the CNOE (Cloud Native Operational Excellence)
open source organization:

Please take a look here for detailed documentation on those agents: https://github.com/cnoe-io/agentic-ai/wiki/Getting%E2%80%90Started

- agent-template (https://github.com/cnoe-io/agent-template) - template to be used as a starting point for creating new ACP agents

- agent-argocd (https://github.com/cnoe-io/agent-argocd) - agent for interacting with ArgoCD

- agent-atlassian (https://github.com/cnoe-io/agent-atlassian) - agent for managing JIRA

- agent-github (https://github.com/cnoe-io/agent-github) - agent for managing github

- agent-slack (https://github.com/cnoe-io/agent-slack) - agent for interacting with slack

## Configuration

### A2A agents

To configure the plugin to connect to any of the CNOE agents you need to configure the url of the running agent in the backstage portal config file:

**baseUrl** - url of the running agent

## Getting started

The plugin can be accessed by running `yarn start` in the root directory, and then navigating to [/agent-forge](http://localhost:3000/agent-forge).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
