# Pointing Poker Backend Module for Jira

A backend module for the [Pointing Poker](../pointing-poker/README.md) plugin that uses Jira as the ticket provider. It searches issues with JQL, shows issue details, subtasks and comments during a session, and writes the agreed story points back to the issue.

## Supported Jira versions

Only **Jira Cloud** is supported. The module uses the Jira Cloud REST API v3 and authenticates with an Atlassian account email and API token. Jira Data Center / Server (on-prem) is not supported.

## Installation

Make sure the [Pointing Poker backend plugin](../pointing-poker-backend/README.md) is installed, then add the module:

```bash
yarn --cwd packages/backend add @backstage-community/plugin-pointing-poker-backend-module-jira
```

```ts
backend.add(import('@backstage-community/plugin-pointing-poker-backend'));
backend.add(
  import('@backstage-community/plugin-pointing-poker-backend-module-jira'),
);
```

## Configuration

```yaml
pointingPoker:
  providers:
    jira:
      host: https://your-company.atlassian.net
      email: ${JIRA_USER_EMAIL}
      apiToken: ${JIRA_API_TOKEN}
```

| Key        | Description                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `host`     | Base URL of your Jira Cloud site.                                                                                                           |
| `email`    | Email of the Atlassian account the plugin acts as.                                                                                          |
| `apiToken` | [API token](https://id.atlassian.com/manage-profile/security/api-tokens) for that account. The token stays on the backend (secret setting). |

The account needs permission to browse the projects you estimate in, comment on issues, and edit the story points field.
