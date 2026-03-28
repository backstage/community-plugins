/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function seed(knex) {
  await knex('announcements').del();
  await knex('announcements').insert([
    {
      id: '1',
      publisher: 'group:default/platform-engineering',
      title: 'Welcome to Our Internal Developer Portal',
      excerpt:
        'Your new home for discovering services, creating new projects, and accessing documentation.',
      body: `We're excited to announce the launch of our Internal Developer Portal, powered by Backstage!

## What is Backstage?

Backstage is an open platform for building developer portals, originally created at Spotify. It provides a centralized place to:

- **Discover services**: Browse our software catalog to find APIs, libraries, and services across the organization
- **Create new projects**: Use software templates to scaffold new services with best practices baked in
- **Access documentation**: Find TechDocs for any service, all in one place
- **Monitor health**: View CI/CD status, Kubernetes deployments, and more

## Getting Started

1. Browse the [Software Catalog](/catalog) to explore existing services
2. Check out [TechDocs](/docs) for documentation
3. Use the [Create](/create) page to scaffold new projects

If you have questions, reach out to the Platform Engineering team in #platform-support.`,
      created_at: '2024-01-15T09:00:00.000Z',
      updated_at: '2024-01-15T09:00:00.000Z',
      start_at: '2024-01-15T09:00:00.000Z',
      category: 'platform-updates',
      tags: JSON.stringify(['catalog', 'techdocs', 'scaffolder']),
      active: true,
      on_behalf_of: 'group:default/team-a',
    },
    {
      id: '2',
      publisher: 'group:default/security',
      title: 'Critical: Update Your Dependencies for CVE-2024-XXXX',
      excerpt:
        'A critical vulnerability has been identified. All teams must update affected packages by Friday.',
      body: `## Summary

A critical vulnerability (CVE-2024-XXXX) has been identified in \`lodash\` versions < 4.17.21. This vulnerability allows prototype pollution attacks that could lead to remote code execution.

## Affected Services

Any service using \`lodash\` < 4.17.21 is affected. You can check your dependencies by running:

\`\`\`bash
npm ls lodash
# or
yarn why lodash
\`\`\`

## Required Action

Update \`lodash\` to version 4.17.21 or later:

\`\`\`bash
npm update lodash
# or
yarn upgrade lodash
\`\`\`

## Deadline

All teams must complete this update by **Friday, January 26th at 5:00 PM**.

## Questions?

Contact the Security team in #security-incidents or email security@company.com.`,
      created_at: '2024-01-22T14:30:00.000Z',
      updated_at: '2024-01-22T16:45:00.000Z',
      start_at: '2024-01-22T14:30:00.000Z',
      category: 'security',
      tags: JSON.stringify(['action-required', 'backend', 'frontend', 'node']),
      active: true,
    },
    {
      id: '3',
      publisher: 'group:default/platform-engineering',
      title: 'New Backend System Migration Guide Available',
      excerpt:
        'Documentation for migrating plugins to the new Backstage backend system is now available.',
      body: `We've published comprehensive documentation for migrating your plugins to the new Backstage backend system.

## Why Migrate?

The new backend system provides:

- **Better modularity**: Plugins are more isolated and easier to test
- **Improved dependency injection**: Services are now properly typed and discoverable
- **Simplified configuration**: Less boilerplate, more convention over configuration
- **Enhanced observability**: Built-in support for logging, metrics, and tracing

## Migration Resources

- [Migration Guide](/docs/default/component/backstage-backend-migration)
- [New Backend System Architecture](/docs/default/component/new-backend-architecture)
- [Example Migrated Plugin](https://github.com/company/backstage-plugins/tree/main/examples/migrated-plugin)

## Timeline

- **Phase 1** (Now - March 1): Core plugins migration by Platform team
- **Phase 2** (March 1 - April 15): Team-owned plugins should begin migration
- **Phase 3** (April 15 - May 31): All plugins migrated, legacy system deprecated

## Office Hours

We're hosting weekly office hours every Wednesday at 2 PM to help with migrations. Join us in #backstage-office-hours.`,
      created_at: '2024-02-01T10:00:00.000Z',
      updated_at: '2024-02-05T11:30:00.000Z',
      start_at: '2024-02-01T10:00:00.000Z',
      category: 'documentation',
      tags: JSON.stringify(['new-backend-system', 'plugins', 'backend']),
      active: true,
    },
    {
      id: '4',
      publisher: 'group:default/sre',
      title: 'Scheduled Maintenance: Database Upgrade This Weekend',
      excerpt:
        'PostgreSQL upgrade scheduled for Saturday. Expect 30 minutes of read-only mode.',
      body: `## Maintenance Window

**Date**: Saturday, February 10th
**Time**: 2:00 AM - 4:00 AM EST
**Expected Downtime**: ~30 minutes of read-only mode

## What's Happening

We're upgrading our PostgreSQL clusters from version 14 to 16. This upgrade brings:

- Improved query performance (up to 2x faster for complex queries)
- Better JSON handling with new functions
- Enhanced logical replication capabilities

## Impact

During the maintenance window:

1. **First 90 minutes**: No impact, data migration running in background
2. **Final 30 minutes**: Backstage will be in read-only mode
   - You can browse the catalog and documentation
   - You cannot create new entities or run software templates
   - CI/CD integrations will queue and resume after maintenance

## Questions?

Contact the SRE team in #sre-support.`,
      created_at: '2024-02-07T16:00:00.000Z',
      updated_at: '2024-02-07T16:00:00.000Z',
      start_at: '2024-02-07T16:00:00.000Z',
      until_date: '2024-02-11T00:00:00.000Z',
      category: 'maintenance',
      tags: JSON.stringify(['database', 'action-required']),
      active: true,
    },
    {
      id: '5',
      publisher: 'group:default/developer-experience',
      title: 'Introducing: Software Templates for Microservices',
      excerpt:
        'New templates available for Node.js, Go, and Python microservices with all best practices included.',
      body: `We're excited to announce new software templates that make it easier than ever to create production-ready microservices!

## Available Templates

### Node.js Microservice
- TypeScript with strict mode
- Express.js with OpenAPI documentation
- Jest for testing with >80% coverage requirements
- Docker and Kubernetes manifests
- GitHub Actions CI/CD pipeline
- OpenTelemetry instrumentation

### Go Microservice
- Standard project layout
- Chi router with middleware
- Structured logging with zerolog
- Dockerfile with multi-stage builds
- Helm chart included
- Prometheus metrics endpoint

### Python Microservice
- FastAPI with Pydantic models
- Poetry for dependency management
- pytest with async support
- Type hints throughout
- Dockerfile optimized for size
- Pre-commit hooks configured

## How to Use

1. Navigate to [Create](/create) in Backstage
2. Select your desired template
3. Fill in the required fields
4. Click "Create" and watch the magic happen!

Each template will:
- Create a new GitHub repository
- Set up branch protection rules
- Configure CI/CD pipelines
- Register the service in the Backstage catalog
- Create initial TechDocs

## Feedback

Try them out and let us know what you think in #developer-experience!`,
      created_at: '2024-02-15T11:00:00.000Z',
      updated_at: '2024-02-15T11:00:00.000Z',
      start_at: '2024-02-15T11:00:00.000Z',
      category: 'new-features',
      tags: JSON.stringify(['scaffolder', 'typescript', 'ci-cd']),
      active: true,
      on_behalf_of: 'group:default/team-b',
    },
    {
      id: '6',
      publisher: 'group:default/platform-engineering',
      title: 'Deprecation Notice: Legacy Authentication Provider',
      excerpt:
        'The legacy OAuth provider will be removed on April 1st. Migrate to the new auth system.',
      body: `## What's Being Deprecated

The legacy authentication provider (\`@backstage/plugin-auth-backend-legacy\`) is being deprecated and will be removed on **April 1st, 2024**.

## Why?

The new authentication system provides:

- Support for multiple identity providers simultaneously
- Improved session management
- Better integration with the permissions framework
- Reduced configuration complexity

## Migration Steps

### 1. Update Dependencies

\`\`\`bash
yarn remove @backstage/plugin-auth-backend-legacy
yarn add @backstage/plugin-auth-backend @backstage/plugin-auth-node
\`\`\`

### 2. Update Configuration

Before:
\`\`\`yaml
auth:
  providers:
    google:
      development:
        clientId: \${GOOGLE_CLIENT_ID}
        clientSecret: \${GOOGLE_CLIENT_SECRET}
\`\`\`

After:
\`\`\`yaml
auth:
  providers:
    google:
      signIn:
        resolvers:
          - resolver: emailMatchingUserEntityProfileEmail
\`\`\`

### 3. Update Backend Code

See the [full migration guide](/docs/default/component/auth-migration) for detailed code changes.

## Timeline

- **Now**: Begin migration
- **March 15**: Legacy provider enters maintenance mode (security fixes only)
- **April 1**: Legacy provider removed

## Support

Join #backstage-auth-migration for migration support.`,
      created_at: '2024-02-20T09:00:00.000Z',
      updated_at: '2024-02-20T09:00:00.000Z',
      start_at: '2024-02-20T09:00:00.000Z',
      category: 'deprecations',
      tags: JSON.stringify([
        'breaking-change',
        'authentication',
        'action-required',
        'backend',
      ]),
      active: true,
    },
    {
      id: '7',
      publisher: 'group:default/sre',
      title: 'Post-Incident Review: Catalog Ingestion Outage',
      excerpt:
        'Summary of the February 25th incident affecting catalog entity ingestion.',
      body: `## Incident Summary

**Duration**: February 25th, 10:15 AM - 11:45 AM EST (1 hour 30 minutes)
**Severity**: SEV-2
**Impact**: Catalog entity updates were delayed; no data loss occurred

## What Happened

At 10:15 AM, the catalog ingestion pipeline stopped processing entity updates. Users reported that changes to \`catalog-info.yaml\` files were not being reflected in Backstage.

## Root Cause

A memory leak in the GitHub entity provider caused the ingestion worker to exceed its memory limits. The worker was repeatedly killed by Kubernetes OOM killer, creating a restart loop.

## Timeline

- **10:15 AM**: First alerts fire for catalog ingestion delays
- **10:20 AM**: On-call engineer begins investigation
- **10:35 AM**: Root cause identified as memory issue
- **10:50 AM**: Temporary fix deployed (increased memory limits)
- **11:15 AM**: Permanent fix identified (pagination for large organizations)
- **11:45 AM**: Backlog cleared, all entities up to date

## Action Items

1. ✅ Increase memory limits for ingestion workers (completed)
2. 🔄 Implement pagination for GitHub org fetching (in progress)
3. 📋 Add memory usage alerts for ingestion workers (scheduled)
4. 📋 Create runbook for catalog ingestion issues (scheduled)

## Lessons Learned

- We need better observability into the ingestion pipeline
- Memory limits should have buffer for unexpected spikes
- Pagination should be default for any external API calls`,
      created_at: '2024-02-27T15:00:00.000Z',
      updated_at: '2024-02-27T15:00:00.000Z',
      start_at: '2024-02-27T15:00:00.000Z',
      category: 'incidents',
      tags: JSON.stringify(['catalog', 'observability']),
      active: true,
    },
    {
      id: '8',
      publisher: 'group:default/developer-experience',
      title: 'Best Practices: Writing Effective catalog-info.yaml Files',
      excerpt:
        'Tips and guidelines for creating well-structured catalog entity definitions.',
      body: `Good \`catalog-info.yaml\` files are the foundation of a healthy software catalog. Here are our recommended best practices.

## Essential Metadata

Always include these fields:

\`\`\`yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  description: A clear, one-line description of what this service does
  annotations:
    github.com/project-slug: company/my-service
    backstage.io/techdocs-ref: dir:.
  tags:
    - python
    - api
    - payments
  links:
    - url: https://my-service.company.com
      title: Production
      icon: dashboard
spec:
  type: service
  lifecycle: production
  owner: team-payments
  system: payments-platform
\`\`\`

## Ownership

- Always set \`spec.owner\` to a valid team in the catalog
- Use team references (\`team-payments\`) not individual users
- If ownership is unclear, use \`team-platform\` temporarily and create a ticket

## Relationships

Define relationships to help users understand your system:

\`\`\`yaml
spec:
  dependsOn:
    - resource:default/payments-database
    - component:default/auth-service
  providesApis:
    - payments-api
  consumesApis:
    - users-api
\`\`\`

## Tags

Use consistent tags across the organization:

- **Language**: \`python\`, \`go\`, \`typescript\`, \`java\`
- **Type**: \`api\`, \`frontend\`, \`worker\`, \`library\`
- **Domain**: \`payments\`, \`users\`, \`inventory\`

## Common Mistakes

❌ Missing or vague descriptions
❌ Using personal names instead of team names for ownership
❌ Not linking to related systems and APIs
❌ Inconsistent tagging conventions

## Validation

Use the catalog linter before committing:

\`\`\`bash
npx @backstage/cli catalog-info validate catalog-info.yaml
\`\`\``,
      created_at: '2024-03-05T10:00:00.000Z',
      updated_at: '2024-03-05T10:00:00.000Z',
      start_at: '2024-03-05T10:00:00.000Z',
      category: 'best-practices',
      tags: JSON.stringify(['catalog', 'documentation']),
      active: true,
    },
    {
      id: '9',
      publisher: 'group:default/platform-engineering',
      title: 'Node.js 18 to 20 Migration Required by April 30th',
      excerpt:
        'Node.js 18 reaches end-of-life. All services must upgrade to Node.js 20 LTS.',
      body: `## Overview

Node.js 18 reaches end-of-life on **April 30th, 2024**. All services must upgrade to Node.js 20 LTS before this date.

## Why Upgrade?

Node.js 20 LTS brings:

- Native test runner improvements
- Stable fetch API (no more node-fetch!)
- Permission model for security
- Performance improvements (V8 11.3)

## Migration Steps

### 1. Update .nvmrc

\`\`\`
20.11.0
\`\`\`

### 2. Update package.json

\`\`\`json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
\`\`\`

### 3. Update Dockerfile

\`\`\`dockerfile
FROM node:20-alpine
\`\`\`

### 4. Update CI/CD

GitHub Actions:
\`\`\`yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
\`\`\`

### 5. Test Locally

\`\`\`bash
nvm use 20
yarn install
yarn test
yarn build
\`\`\`

## Breaking Changes to Watch

- \`url.parse()\` is fully deprecated, use \`new URL()\`
- Some undici behaviors changed
- \`--experimental-specifier-resolution\` flag removed

## Resources

- [Node.js 20 Release Notes](https://nodejs.org/en/blog/release/v20.0.0)
- [Migration Guide](/docs/default/component/node-20-migration)

## Deadline

**April 30th, 2024** - No exceptions. After this date, security patches won't be available for Node.js 18.`,
      created_at: '2024-03-10T09:00:00.000Z',
      updated_at: '2024-03-10T09:00:00.000Z',
      start_at: '2024-03-10T09:00:00.000Z',
      category: 'deprecations',
      tags: JSON.stringify(['node', 'action-required', 'breaking-change']),
      active: true,
    },
    {
      id: '10',
      publisher: 'group:default/developer-experience',
      title: 'New Plugin: Kubernetes Cost Insights',
      excerpt:
        'Track and optimize your Kubernetes spending directly in Backstage.',
      body: `We're launching a new plugin that brings Kubernetes cost visibility directly into Backstage!

## Features

### Cost Dashboard
View real-time spending by:
- Namespace
- Deployment
- Team (via catalog ownership)
- Environment (dev/staging/prod)

### Recommendations
Get actionable recommendations:
- Right-sizing suggestions for over-provisioned pods
- Idle resource detection
- Reserved capacity opportunities

### Budgets & Alerts
Set spending limits:
- Per-service monthly budgets
- Alerting when approaching limits
- Slack notifications for budget breaches

## How It Works

The plugin integrates with:
- **Kubecost** for cost data
- **Backstage Catalog** for ownership mapping
- **Prometheus** for resource metrics

## Enabling for Your Services

Add the annotation to your \`catalog-info.yaml\`:

\`\`\`yaml
metadata:
  annotations:
    kubernetes.io/namespace: my-service-prod
    backstage.io/kubernetes-cluster: production
\`\`\`

## Demo

Join us for a demo this Thursday at 3 PM in #backstage-demos.

## Feedback

This is an early release. Please share feedback in #developer-experience!`,
      created_at: '2024-03-15T11:00:00.000Z',
      updated_at: '2024-03-15T11:00:00.000Z',
      start_at: '2024-03-15T11:00:00.000Z',
      category: 'new-features',
      tags: JSON.stringify(['kubernetes', 'plugins', 'observability']),
      active: true,
    },
    {
      id: '11',
      publisher: 'group:default/security',
      title: 'New Permissions Framework Now Available',
      excerpt:
        'Fine-grained access control is here. Start defining permissions for your plugins.',
      body: `The Backstage Permissions Framework is now fully available in our deployment!

## What is the Permissions Framework?

The permissions framework allows you to:

- Define fine-grained access control for any action
- Create custom policies based on resource ownership
- Integrate with your existing identity provider
- Audit who accessed what and when

## Default Policies

We've set up sensible defaults:

| Action | Who Can Perform |
|--------|-----------------|
| View catalog entities | Everyone |
| Create software templates | Engineers |
| Delete entities | Entity owners only |
| Manage plugins | Platform team |
| View TechDocs | Everyone |

## Customizing Permissions

You can define custom rules in your plugin:

\`\`\`typescript
import { createPermission } from '@backstage/plugin-permission-common';

export const myPluginReadPermission = createPermission({
  name: 'myPlugin.read',
  attributes: { action: 'read' },
});
\`\`\`

## Requesting Policy Changes

If your team needs different permissions:

1. Open a ticket in #platform-support
2. Describe the use case
3. We'll work with you to implement appropriate policies

## Documentation

- [Permissions Framework Overview](/docs/default/component/permissions-overview)
- [Writing Permission Policies](/docs/default/component/writing-policies)
- [Plugin Integration Guide](/docs/default/component/plugin-permissions)`,
      created_at: '2024-03-20T14:00:00.000Z',
      updated_at: '2024-03-20T14:00:00.000Z',
      start_at: '2024-03-20T14:00:00.000Z',
      category: 'new-features',
      tags: JSON.stringify(['permissions', 'authentication', 'plugins']),
      active: true,
    },
    {
      id: '12',
      publisher: 'group:default/platform-engineering',
      title: 'Backstage Upgrade to 1.25: What You Need to Know',
      excerpt:
        'We are upgrading to Backstage 1.25 this weekend. Review the changes that may affect you.',
      body: `## Upgrade Schedule

**When**: Saturday, March 30th, 6:00 AM - 8:00 AM EST
**Expected Downtime**: 15-30 minutes during final switchover

## Notable Changes in 1.25

### New Features

1. **Improved Search**: Search now indexes more entity metadata, making it easier to find what you need

2. **Catalog Performance**: Entity ingestion is 40% faster for large organizations

3. **React 18 Support**: Frontend plugins can now use React 18 features

### Breaking Changes

#### For Plugin Authors

\`\`\`typescript
// Before
import { useApi } from '@backstage/core-plugin-api';

// After (if using new backend system)
import { useApi } from '@backstage/frontend-plugin-api';
\`\`\`

#### For All Users

- The search query syntax has changed slightly. Use \`kind:component\` instead of \`type:component\`
- Some catalog filters have been renamed for consistency

### Deprecated Features

The following features are now deprecated and will be removed in 1.27:

- Legacy scaffolder task UI
- Old-style entity cards without the card wrapper
- Direct database access patterns (use the catalog client instead)

## Action Required

1. **Plugin Authors**: Review your plugins for compatibility
2. **All Users**: Update any saved search queries

## Questions?

Join our office hours on Friday at 2 PM to discuss the upgrade.`,
      created_at: '2024-03-25T10:00:00.000Z',
      updated_at: '2024-03-25T10:00:00.000Z',
      start_at: '2024-03-25T10:00:00.000Z',
      until_date: '2024-03-31T00:00:00.000Z',
      category: 'maintenance',
      tags: JSON.stringify([
        'action-required',
        'plugins',
        'search',
        'frontend',
        'react',
      ]),
      active: true,
    },
    {
      id: '13',
      publisher: 'group:default/developer-experience',
      title: 'Backstage Community Meetup: April 10th',
      excerpt:
        'Join us for our quarterly Backstage community meetup with lightning talks and demos.',
      body: `## Backstage Community Meetup

**Date**: Wednesday, April 10th
**Time**: 4:00 PM - 6:00 PM EST
**Location**: Main Auditorium + Virtual (Zoom link in calendar invite)

## Agenda

### 4:00 PM - Welcome & Updates
Platform team shares what's new and what's coming

### 4:15 PM - Lightning Talks (10 mins each)

1. **"How We Cut Our CI/CD Time by 60%"** - Sarah from Team Payments
2. **"Building a Custom Scaffolder Action"** - Marcus from Team Infrastructure
3. **"TechDocs Tips & Tricks"** - Alex from Team Documentation

### 5:00 PM - Live Demo
New features showcase by the Developer Experience team

### 5:30 PM - Open Discussion
Share your pain points, feature requests, and ideas

### 6:00 PM - Networking
Snacks and drinks provided!

## Submit Your Talk

Want to share something? We have 2 more lightning talk slots available!

Submit your proposal in #backstage-community by April 3rd.

## RSVP

Please RSVP in the calendar event so we can order enough food.

Looking forward to seeing you there! 🎉`,
      created_at: '2024-03-28T11:00:00.000Z',
      updated_at: '2024-03-28T11:00:00.000Z',
      start_at: '2024-03-28T11:00:00.000Z',
      until_date: '2024-04-11T00:00:00.000Z',
      category: 'events',
      tags: JSON.stringify(['community']),
      active: true,
    },
    {
      id: '14',
      publisher: 'group:default/sre',
      title: 'Search Plugin Maintenance: Elasticsearch Index Rebuild',
      excerpt:
        'Search functionality will be degraded for ~2 hours during index rebuild.',
      body: `## Scheduled Maintenance

**When**: Tuesday, April 2nd, 2:00 AM - 4:00 AM EST
**Impact**: Search results may be incomplete or slightly delayed

## What's Happening

We're rebuilding the Elasticsearch indices to:

- Improve search relevance
- Add support for new entity types
- Optimize query performance

## What to Expect

During the maintenance window:

1. **First hour**: Old index still serving, no impact
2. **Second hour**: Transition period, some results may be missing
3. **After maintenance**: All entities fully indexed, improved relevance

## Workarounds

If you need to find something during the maintenance:

- Browse the catalog directly using filters
- Use the GitHub/GitLab search for code
- Check TechDocs if looking for documentation

## Questions?

Reach out in #sre-support if you have concerns.`,
      created_at: '2024-03-30T15:00:00.000Z',
      updated_at: '2024-03-30T15:00:00.000Z',
      start_at: '2024-03-30T15:00:00.000Z',
      until_date: '2024-04-03T00:00:00.000Z',
      category: 'maintenance',
      tags: JSON.stringify(['search', 'database']),
      active: true,
    },
    {
      id: '15',
      publisher: 'group:default/platform-engineering',
      title: 'API Documentation Plugin Now Integrated with OpenAPI',
      excerpt:
        'View and interact with your OpenAPI specs directly in Backstage.',
      body: `We've enhanced the API documentation experience with full OpenAPI integration!

## New Features

### Interactive API Explorer
- Try out API endpoints directly in Backstage
- Automatically populated with example requests
- View response schemas and examples

### Automatic Sync
- OpenAPI specs are synced from your repository automatically
- Changes to your spec file appear within 5 minutes
- Version history available in the changelog tab

### SDK Generation
- Generate client SDKs for TypeScript, Python, Go, and Java
- Download pre-built packages or use the scaffolder
- Types are always in sync with your API

## How to Enable

Add the OpenAPI annotation to your API entity:

\`\`\`yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: payments-api
  annotations:
    backstage.io/openapi-spec-url: https://raw.githubusercontent.com/company/payments-service/main/openapi.yaml
spec:
  type: openapi
  lifecycle: production
  owner: team-payments
  definition: |
    $text: ./openapi.yaml
\`\`\`

## Try It Out

Check out the [Payments API](/catalog/default/api/payments-api) for a live example.

## Feedback

Let us know how it works for you in #developer-experience!`,
      created_at: '2024-04-05T10:00:00.000Z',
      updated_at: '2024-04-05T10:00:00.000Z',
      start_at: '2024-04-05T10:00:00.000Z',
      category: 'new-features',
      tags: JSON.stringify(['api', 'documentation', 'plugins']),
      active: true,
    },
    {
      id: '16',
      publisher: 'user:default/guest',
      title: 'TechDocs Best Practices: Keeping Documentation Fresh',
      excerpt:
        'Tips for maintaining up-to-date documentation that developers actually use.',
      body: `Great documentation is a competitive advantage. Here's how to keep your TechDocs fresh and useful.

## The Problem

We've all seen it: documentation that was written once and never updated. It becomes a liability instead of an asset.

## Solutions That Work

### 1. Documentation as Code

Treat docs like code:
- Review docs in PRs
- Include docs updates in your definition of done
- Use linting for consistency

### 2. Ownership Matters

Every doc should have an owner:

\`\`\`yaml
# mkdocs.yml
site_name: My Service
nav:
  - index.md
  - architecture.md
  - runbook.md

# Each page has a metadata block
---
owner: team-payments
last_reviewed: 2024-03-15
---
\`\`\`

### 3. Automate What You Can

- Auto-generate API docs from code
- Include CI output in architecture docs
- Embed live system diagrams

### 4. Regular Review Cycles

Schedule quarterly reviews:
- Is this still accurate?
- Is anything missing?
- Can anything be removed?

### 5. Make It Discoverable

- Use consistent naming
- Add good descriptions to mkdocs.yml
- Cross-link between related docs

## Template

We've added a "Documentation Review" software template that creates a quarterly review reminder with a checklist. Try it in the Create page!`,
      created_at: '2024-04-10T14:00:00.000Z',
      updated_at: '2024-04-10T14:00:00.000Z',
      start_at: '2024-04-10T14:00:00.000Z',
      category: 'best-practices',
      tags: JSON.stringify(['techdocs', 'documentation']),
      active: true,
    },
    {
      id: '17',
      publisher: 'group:default/security',
      title: 'GitHub Actions Security: New Required Workflow Checks',
      excerpt:
        'New security scanning requirements for all CI/CD pipelines using GitHub Actions.',
      body: `## New Requirements

Starting May 1st, all GitHub Actions workflows must include:

1. **Dependency Scanning** - Identify vulnerable dependencies
2. **Secret Scanning** - Prevent credential leaks
3. **Container Scanning** - If building Docker images

## Implementation

Add the security job to your workflow:

\`\`\`yaml
jobs:
  security:
    uses: company/shared-workflows/.github/workflows/security-scan.yaml@v2
    with:
      scan-dependencies: true
      scan-secrets: true
      scan-containers: \${{ github.event_name == 'push' }}
\`\`\`

Or use our reusable workflow that includes everything:

\`\`\`yaml
jobs:
  ci:
    uses: company/shared-workflows/.github/workflows/standard-ci.yaml@v2
\`\`\`

## What Gets Scanned

| Scan Type | Tools Used | Failure Threshold |
|-----------|-----------|------------------|
| Dependencies | Dependabot, Snyk | Critical/High |
| Secrets | GitLeaks, TruffleHog | Any finding |
| Containers | Trivy | Critical |

## Exceptions

If you have a valid reason for exception:
1. Create a security ticket
2. Get approval from Security team
3. Document in your repo's SECURITY.md

## Timeline

- **Now**: Start adding scans (optional)
- **April 15**: Scans required for new repos
- **May 1**: Scans required for all repos

## Questions?

Join #security-cicd for implementation help.`,
      created_at: '2024-04-12T09:00:00.000Z',
      updated_at: '2024-04-12T09:00:00.000Z',
      start_at: '2024-04-12T09:00:00.000Z',
      category: 'security',
      tags: JSON.stringify(['ci-cd', 'action-required']),
      active: true,
    },
    {
      id: '18',
      publisher: 'group:default/platform-engineering',
      title: 'React 18 Migration Complete in Backstage',
      excerpt:
        'Backstage frontend now runs on React 18. Review the migration notes for your plugins.',
      body: `## Migration Complete

As of today, our Backstage deployment is running React 18! 🎉

## What Changed

### Concurrent Features Available
You can now use:
- \`useTransition\` for non-urgent updates
- \`useDeferredValue\` for expensive computations
- Automatic batching for better performance

### Strict Mode Enabled
React 18's Strict Mode is now enabled in development. This means:
- Components mount, unmount, and remount in dev
- Effects run twice to catch bugs
- Your code should be resilient to this

## Plugin Author Action Required

### Check for Warnings

Run your plugin locally and check for:

1. **Legacy Context API warnings**
   \`\`\`
   Warning: Legacy context API detected
   \`\`\`
   Solution: Migrate to modern Context API

2. **findDOMNode deprecation**
   \`\`\`
   Warning: findDOMNode is deprecated
   \`\`\`
   Solution: Use refs instead

3. **String refs**
   \`\`\`
   Warning: A string ref has been found
   \`\`\`
   Solution: Use callback or object refs

### Test Your Components

\`\`\`bash
cd plugins/my-plugin
yarn test
yarn start
\`\`\`

## Resources

- [React 18 Upgrade Guide](https://react.dev/blog/2022/03/08/react-18-upgrade-guide)
- [Internal Migration Guide](/docs/default/component/react-18-migration)

## Issues?

Report problems in #backstage-frontend or open an issue in the plugins repo.`,
      created_at: '2024-04-15T11:00:00.000Z',
      updated_at: '2024-04-15T11:00:00.000Z',
      start_at: '2024-04-15T11:00:00.000Z',
      category: 'platform-updates',
      tags: JSON.stringify(['react', 'frontend', 'plugins']),
      active: true,
    },
    {
      id: '19',
      publisher: 'group:default/sre',
      title: 'OpenTelemetry Tracing Now Available',
      excerpt:
        'Distributed tracing is enabled. See request flows across your services.',
      body: `## Distributed Tracing is Here!

You can now trace requests across services using OpenTelemetry!

## Features

### Trace Visualization
- See end-to-end request flows
- Identify bottlenecks and slow services
- Correlate traces with logs

### Service Map
- Visualize service dependencies
- See real-time traffic patterns
- Identify error hotspots

### Integration with Backstage
- Click "Traces" tab on any service page
- Filter by operation, status, duration
- Link directly to Jaeger/Tempo

## Enabling for Your Service

### 1. Add the SDK

\`\`\`bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
\`\`\`

### 2. Initialize Tracing

\`\`\`typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'my-service',
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
\`\`\`

### 3. Add Environment Variables

\`\`\`yaml
OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4318
OTEL_SERVICE_NAME: my-service
\`\`\`

## Default Instrumentation

Auto-instrumentation covers:
- HTTP requests (incoming and outgoing)
- Database queries (PostgreSQL, MySQL, MongoDB)
- Redis operations
- gRPC calls

## Dashboard

View traces in Grafana: [Traces Dashboard](https://grafana.company.com/explore?orgId=1&left=["traces"])

## Questions?

Reach out to #observability for help with implementation.`,
      created_at: '2024-04-18T10:00:00.000Z',
      updated_at: '2024-04-18T10:00:00.000Z',
      start_at: '2024-04-18T10:00:00.000Z',
      category: 'new-features',
      tags: JSON.stringify(['observability', 'backend']),
      active: true,
    },
    {
      id: '20',
      publisher: 'group:default/developer-experience',
      title: 'New Software Template: Full-Stack Next.js Application',
      excerpt:
        'Scaffold a complete Next.js app with authentication, database, and deployment.',
      body: `We've added a new template for building full-stack Next.js applications!

## What's Included

### Frontend
- Next.js 14 with App Router
- TypeScript throughout
- Tailwind CSS for styling
- Component library (Shadcn/ui)
- Storybook for component development

### Backend
- Next.js API routes
- Prisma ORM with PostgreSQL
- NextAuth.js for authentication
- tRPC for type-safe APIs

### Infrastructure
- Docker and docker-compose for local dev
- Terraform modules for AWS deployment
- GitHub Actions CI/CD
- Kubernetes manifests for production

### Developer Experience
- ESLint + Prettier pre-configured
- Husky pre-commit hooks
- Jest + React Testing Library
- Playwright for E2E tests
- TechDocs auto-generated

## How to Use

1. Go to [Create](/create)
2. Select "Full-Stack Next.js Application"
3. Fill in your project details:
   - Repository name
   - Team ownership
   - AWS environment
4. Click Create!

## Demo

See a live demo: [Demo Next.js App](https://demo-nextjs.company.com)

## Template Source

View the template definition: [nextjs-fullstack-template](https://github.com/company/software-templates/tree/main/templates/nextjs-fullstack)

## Feedback

We'd love to hear what other templates would be useful. Drop suggestions in #developer-experience!`,
      created_at: '2024-04-22T11:00:00.000Z',
      updated_at: '2024-04-22T11:00:00.000Z',
      start_at: '2024-04-22T11:00:00.000Z',
      category: 'new-features',
      tags: JSON.stringify(['scaffolder', 'react', 'frontend', 'typescript']),
      active: true,
    },
  ]);

  // Seed announcement-entity relationships
  await knex('announcement_entities').del();
  await knex('announcement_entities').insert([
    {
      announcement_id: '17',
      entity_ref: 'component:default/ci-runner',
    },
  ]);
};
