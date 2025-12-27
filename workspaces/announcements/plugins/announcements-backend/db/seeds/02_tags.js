/*
 * Copyright 2025 The Backstage Authors
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
 * Seeded tags for the announcements plugin
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function seed(knex) {
  await knex('tags').del();
  await knex('tags').insert([
    { slug: 'breaking-change', title: 'Breaking Change' },
    { slug: 'action-required', title: 'Action Required' },
    { slug: 'backend', title: 'Backend' },
    { slug: 'frontend', title: 'Frontend' },
    { slug: 'plugins', title: 'Plugins' },
    { slug: 'catalog', title: 'Catalog' },
    { slug: 'scaffolder', title: 'Scaffolder' },
    { slug: 'techdocs', title: 'TechDocs' },
    { slug: 'kubernetes', title: 'Kubernetes' },
    { slug: 'ci-cd', title: 'CI/CD' },
    { slug: 'api', title: 'API' },
    { slug: 'authentication', title: 'Authentication' },
    { slug: 'permissions', title: 'Permissions' },
    { slug: 'search', title: 'Search' },
    { slug: 'new-backend-system', title: 'New Backend System' },
    { slug: 'node', title: 'Node.js' },
    { slug: 'typescript', title: 'TypeScript' },
    { slug: 'react', title: 'React' },
    { slug: 'database', title: 'Database' },
    { slug: 'observability', title: 'Observability' },
  ]);
};
