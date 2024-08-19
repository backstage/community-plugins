/* eslint-disable func-names */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
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
