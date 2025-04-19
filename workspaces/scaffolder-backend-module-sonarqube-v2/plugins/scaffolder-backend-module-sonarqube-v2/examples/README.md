# SonarQube Module for Backstage Scaffolder - Examples

This directory contains example templates for using the SonarQube module with Backstage Scaffolder.

## Available Templates

### 1. Basic SonarQube Project Creation

File: [`templates/01-create-sonarqube-project.yaml`](./templates/01-create-sonarqube-project.yaml)

This template demonstrates how to create a SonarQube project using the `sonarqube:create:project` action.

### 2. SonarQube Project with CI/CD Integration

File: [`templates/02-sonarqube-with-cicd.yaml`](./templates/02-sonarqube-with-cicd.yaml)

This template shows how to create a SonarQube project and integrate it with one of the following CI/CD tools:

- GitHub Actions
- Jenkins
- Azure DevOps
- GitLab CI/CD

## How to Use

1. Copy the template file(s) to your Backstage installation's template directory
2. Register the template(s) in your Backstage catalog
3. Navigate to the "Create" page in your Backstage instance
4. Select the template from the list and follow the guided steps

## Customization

You can customize these templates to fit your organization's needs. Some common customizations include:

- Adding organization-specific SonarQube quality profiles or gates
- Pre-configuring project settings based on company standards
- Integrating with additional tools in your development pipeline
- Adding specific project settings or exclusions for better analysis results
