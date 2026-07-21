#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const packages = [
  'workspaces/adr/package.json',
  'workspaces/airbrake/package.json',
  'workspaces/allure/package.json',
  'workspaces/analytics/package.json',
  'workspaces/apache-airflow/package.json',
  'workspaces/apollo-explorer/package.json',
  'workspaces/azure-sites/package.json',
  'workspaces/badges/package.json',
  'workspaces/bazaar/package.json',
  'workspaces/bitrise/package.json',
  'workspaces/cloudbuild/package.json',
  'workspaces/code-climate/package.json',
  'workspaces/codescene/package.json',
  'workspaces/cost-insights/package.json',
  'workspaces/dynatrace/package.json',
  'workspaces/entity-feedback/package.json',
  'workspaces/entity-validation/package.json',
  'workspaces/explore/package.json',
  'workspaces/firehydrant/package.json',
  'workspaces/fossa/package.json',
  'workspaces/gcalendar/package.json',
  'workspaces/gcp-projects/package.json',
  'workspaces/git-release-manager/package.json',
  'workspaces/github-deployments/package.json',
  'workspaces/github-issues/package.json',
  'workspaces/github-pull-requests-board/package.json',
  'workspaces/gitops-profiles/package.json',
  'workspaces/gocd/package.json',
  'workspaces/graphiql/package.json',
  'workspaces/ilert/package.json',
  'workspaces/kafka/package.json',
  'workspaces/lighthouse/package.json',
  'workspaces/linguist/package.json',
  'workspaces/microsoft-calendar/package.json',
  'workspaces/newrelic/package.json',
  'workspaces/nomad/package.json',
  'workspaces/octopus-deploy/package.json',
  'workspaces/opencost/package.json',
  'workspaces/periskop/package.json',
  'workspaces/playlist/package.json',
  'workspaces/puppetdb/package.json',
  'workspaces/rollbar/package.json',
  'workspaces/shortcuts/package.json',
  'workspaces/splunk/package.json',
  'workspaces/stack-overflow/package.json',
  'workspaces/stackstorm/package.json',
  'workspaces/vault/package.json',
  'workspaces/xcmetrics/package.json',
];

const dependencyName = 'csstype@npm:^3.1.3'; // Set your dependency name here
const resolutionVersion = '3.0.9'; // Set your desired resolution version here

for (const packagePath of packages) {
  const fullPath = resolve(packagePath);
  const packageJson = JSON.parse(await readFile(fullPath, 'utf8'));

  if (!packageJson.resolutions) {
    packageJson.resolutions = {};
  }

  packageJson.resolutions[dependencyName] = resolutionVersion;

  await writeFile(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(
    `Updated resolution for ${dependencyName} in ${packagePath} to ${resolutionVersion}`,
  );
}
