# @backstage-community/plugin-search-backend-module-github-discussions

The github-discussions backend module for the search plugin.

This package exports a module that extends the search backend to index all discussions from a specified GitHub repository, including all comments and replies for each discussion.

## Prerequisites

- [GitHub Integration](https://backstage.io/docs/integrations/github/github-apps)

## Installation

Add the module package as a dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-search-backend-module-github-discussions
```

Then, add the collator to your backend instance, along with the search plugin itself:

```diff
# packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
+ backend.add(import('@backstage/plugin-search-backend/alpha'));
+ backend.add(
+   import('@backstage-community/plugin-search-backend-module-github-discussions'),
+ );
backend.start();
```

## Configuration

The `url` is the only required configuration option for the collator. All other settings are optional.

```yaml
# app-config.yaml
search:
  collators:
    githubDiscussions:
      url: https://github.com/my-org/my-repository # required
      schedule:
        initialDelay: { seconds: 10 }
        timeout: { minutes: 10 }
        frequency: { minutes: 30 }
      cacheBase: file:///example/path/backstage/.cache
      clearCacheOnSuccess: false
      discussionsBatchSize: 50
      commentsBatchSize: 50
      repliesBatchSize: 50
```

### Cache Base

You can specify a file URI for the cache storage location. If no cache base is provided, it will default to writing cache inside `node_modules/github-discussions-fetcher`.

### Clearing Cache

Cache will be cleared by default after each successful run of `execute()` of the search collator.

> 🚨 Important: Clearing the cache will delete all contents within the specified cache base. Ensure that the file URI provided is dedicated solely to caching.

### Batch Sizes

The collator will fetch all discussions, every comment in each discussion, and every reply of those comments from the configured repository.

The queries are batched to optimize the number of API requests and to avoid exceeding [GitHub's API Rate Limit](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api).

These sizes can be adjusted to balance efficiency and API limitations. Be aware that larger batch sizes may result in slower responses and could lead to GitHub's API timeout. Although, the collator includes an exponential backoff and retry mechanism to handle failed fetch attempts, you may find the need to adjust the batch sizes.

If the batch sizes aren't configured by the user, it will default to 100.
