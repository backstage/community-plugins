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
  // Deletes ALL existing entries
  await knex('categories').del();
  await knex('categories').insert([
    { slug: 'platform-updates', title: 'Platform Updates' },
    { slug: 'security', title: 'Security' },
    { slug: 'maintenance', title: 'Maintenance' },
    { slug: 'new-features', title: 'New Features' },
    { slug: 'deprecations', title: 'Deprecations' },
    { slug: 'best-practices', title: 'Best Practices' },
    { slug: 'incidents', title: 'Incidents' },
    { slug: 'events', title: 'Events' },
    { slug: 'documentation', title: 'Documentation' },
    { slug: 'community', title: 'Community' },
  ]);
};
