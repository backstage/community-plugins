# AgentForge Backstage Frontend Plugin

This plugin is part of the AGNTCY(agntcy.org) community effort to provide the right tools & protocols for agent to agent communication.
It allows the integration of any agent supporting ACP (Agent Communication Protocol) or A2A (Agent2Agent Protocol) especially the platfrom related agents released under the CNOE (Cloud Native Operational Excellence)
open source organization:

- agent-template (https://github.com/cnoe-io/agent-template) - template to be used as a starting point for creating new ACP agents

- agent-argocd (https://github.com/cnoe-io/agent-argocd) - agent for interacting with ArgoCD

- agent-atlassian (https://github.com/cnoe-io/agent-atlassian) - agent for managing JIRA

## Configuration

### ACP agents

To configure the plugin to connect to any of the CNOE agents there are 3 config values that need to be specified in the backstage portal config file:

**baseUrl** - url of the running agent

**agentId** - the agent ID

**apiKey** - the agent API Key

### A2A agents

If only the **baseUrl** config value is specified, the plugin will try to connect to the agent using the A2A protocol

## Getting started

The plugin can be accessed by running `yarn start` in the root directory, and then navigating to [/agent-forge](http://localhost:3000/agent-forge).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.
