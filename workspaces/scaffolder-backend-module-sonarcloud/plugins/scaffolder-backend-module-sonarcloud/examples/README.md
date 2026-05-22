# Examples

Example Backstage Software Templates demonstrating the SonarCloud scaffolder actions.

## Templates

### [create-project.yaml](./create-project.yaml)

Minimal template that creates a SonarCloud project and sets the default branch. Use this as a starting point if you only need project provisioning without ALM binding or quality gate configuration.

**Actions used**: `sonarcloud:create-project`, `sonarcloud:set-default-branch`

### [full-onboarding.yaml](./full-onboarding.yaml)

Complete onboarding template that demonstrates all five SonarCloud actions in sequence: creates a GitHub repository, provisions a SonarCloud project with ALM binding, assigns a quality gate, configures the new code definition, and registers the component in the Backstage catalog.

**Actions used**: all five (`sonarcloud:create-project`, `sonarcloud:set-default-branch`, `sonarcloud:bind-project`, `sonarcloud:set-quality-gate`, `sonarcloud:set-new-code-definition`)

## Usage

These templates are meant to be copied and adapted for your organization. Before using them:

1. Replace `my-org` with your GitHub organization name
2. Replace `My GitHub App` with the name of your ALM integration in SonarCloud
3. Ensure `SONARCLOUD_TOKEN` is provisioned as a Backstage secret
4. Add a `./skeleton` directory with your service template files
5. Add a `catalog-info.yaml` to the skeleton for Backstage catalog registration
