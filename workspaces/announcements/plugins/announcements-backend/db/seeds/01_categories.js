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
    { slug: 'infrastructure', title: 'Infrastructure' },
    { slug: 'internal-developer-portal', title: 'IDP' },
    { slug: 'cost-savings', title: 'Cost Savings' },
    { slug: 'javascript', title: 'Javascript' },
    { slug: 'ruby-on-rails', title: 'Ruby on Rails' },
    { slug: 'monolith', title: 'Monolith' },
    { slug: 'micro-service', title: 'Micro Service' },
    { slug: 'engineering-community', title: 'Engineering Community' },
    { slug: 'product-updates', title: 'Product Updates' },
    { slug: 'security', title: 'Security' },
    { slug: 'documentation', title: 'Documenation' },
    { slug: 'events', title: 'Events' },
  ]);
};
