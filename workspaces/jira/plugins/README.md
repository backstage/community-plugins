# Jira Plugin

A backstage plugin to view jira breakdown issues in card components.

## Overview

This plugin allows Backstage users to easily integrate and visualize Jira issues within their Backstage app. It provides a comprehensive way to track and manage issues from your Jira projects directly within Backstage, improving workflow and visibility for development teams.

## To install Jira Plugin Dependency

Run the floowing command to add the plugin package to your project

`yarn add @backstage-community/plugin-jira`

## Configure Jira Proxy

Add the following proxy configuration to your app-config.yaml file to enable communication between Backstage and your Jira instance:

```
proxy:
  endpoints:
    '/jira/api':  # Ensure this matches the proxyPath
      target: <JIRA_URL>
      allowedMethods: ['GET', 'POST']
      allowedHeaders: ['Authorization', 'X-Atlassian-Token', 'Content-Type']
      headers:
        Authorization: 'Bearer ${JIRA_TOKEN}'
        Accept: 'application/json'
        Content-Type: 'application/json'
        X-Atlassian-Token: 'no-check'
        Origin: <JIRA_URL>
      User-Agent: "AnyDummyText"
      changeOrigin: true
```

- Replace <JIRA_URL> with the base URL of your Jira instance.
- Ensure that the JIRA_TOKEN environment variable contains a valid Jira API token.
- The User-Agent header is a workaround for Jira API browser origin request rejections. Any dummy text would work.

## Add Jira Configuration

Add the following Jira configuration to your app-config.yaml file to define the portal URL and filtered views:

```
jira:
  portalUrl: 'https://jira.com/browse/'
  filteredViews:
    - issueLabels: 'JIRA-000' # The Jira Labels to group them under API Review Jira Chart.
      title: 'JIRA Review' # The Jira chart title - API Review
```

- portalUrl: The base URL for browsing Jira issues in your Jira instance.
- filteredViews: A list of filtered views for grouping Jira issues by specific labels and titles.
- issueLabels: The Jira labels used to group issues under a specific chart.
- title: The title of the Jira chart for the grouped issues.

## Add Plugin Component to Your Backstage App

You can pass Jira information either from the API catalog entity YAML file or via component props.

### Using API Catalog Entity YAML File

If you choose to pass Jira information from the API catalog entity YAML file, add the following annotations to your YAML file:

```
metadata:
  annotations:
    jira/project-key: <example-jira-project-key>
    jira/label: <example-label> # optional, you may skip this value to fetch data for all labels
    jira/epic-key:  # optional, you may skip this value to fetch data for a specific epic
    jira/incoming-issues-status: <jira-status> # optional, any Jira status equivalent to "To Do" (e.g., To Do, Not Started, etc.)
    jira/inprogress-issues-status: <jira-status> # optional, any Jira status equivalent to "In Progress" (e.g., In Progress, Testing, In Prod, etc.)
    jira/blocked-issues-status: <jira-status> # optional, any Jira status equivalent to "Blocked" (e.g., Blocked, etc.)
    jira/done-issues-status: <jira-status> # optional, any Jira status equivalent to "Done" (e.g., Done, Resolved, etc.)
```

- Replace <example-jira-project-key> with the key of your Jira project.
- The jira/label annotation is optional; you may skip this value to fetch data for all labels.
- The jira/epic-key annotation is optional; you may skip this value to fetch data for a specific epic.
- The jira/incoming-issues-status, jira/inprogress-issues-status, jira/blocked-issues-status, and jira/done-issues-status annotations are optional; you can use any Jira status equivalent to the specified status categories.

Next, add the plugin component to your Backstage instance in the CatalogEntityPage.tsx file:

```
import {
  JiraEntityWrapperCard,
  isJiraAvailable,
} from '@backstage-community/plugin-jira';
import { Grid } from '@material-ui/core';
import { EntitySwitch } from '@backstage/plugin-catalog-react';

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    ...
    <EntitySwitch>
      <EntitySwitch.Case if={isJiraAvailable}>
        <Grid item md={6}>
          <JiraEntityWrapperCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </Grid>
);
```

The JiraEntityWrapperCard component will display Jira issue data based on the annotations provided in the YAML file.
The isJiraAvailable function checks if Jira data is available for the entity.

### Using Component Props

Alternatively, if you pass the Jira information as component props, use the following code:

```
import {
  JiraWrapperCard
} from '@backstage-community/plugin-jira';

<JiraWrapperCard jiraEpic="JIRA-0000" />

```

- Replace "JIRA-0000" with the key of the Jira epic you want to display.
- The JiraWrapperCard component will display Jira issue data based on the provided epic key.
