# Examples

Example Backstage Software Templates demonstrating the SonarCloud scaffolder actions.

## Templates

### [create-project.yaml](./create-project.yaml)

Minimal template that creates a SonarCloud project and sets the default branch.

**Actions used**: `sonarcloud:project:create`, `sonarcloud:defaultBranch:rename`

## Prerequisites

Configure `sonarqube.apiKey` and `sonarqube.organizationName` in your `app-config.yaml`:

```yaml
sonarqube:
  apiKey: ${SONARCLOUD_TOKEN}
  organizationName: my-org
```
