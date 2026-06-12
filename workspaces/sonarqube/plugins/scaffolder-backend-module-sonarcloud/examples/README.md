# Examples

Example Backstage Software Templates demonstrating the SonarCloud scaffolder actions.

## Templates

### [create-project.yaml](./create-project.yaml)

Minimal template that creates a SonarCloud project and sets the default branch.

**Actions used**: `sonarcloud:createProject`, `sonarcloud:setDefaultBranch`

## Usage

These templates are meant to be copied and adapted for your organization. Before using them:

1. Configure `sonarcloud.token` and `sonarcloud.organization` in your `app-config.yaml`
2. Or provision `SONARCLOUD_TOKEN` as a Backstage secret and pass it as input
