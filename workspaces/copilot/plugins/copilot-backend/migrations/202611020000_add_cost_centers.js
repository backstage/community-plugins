/*
 * Copyright 2026 The Backstage Authors
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

const aggregateTables = [
  {
    name: 'copilot_daily_totals',
    uniqueColumns: ['day', 'metrics_type', 'entity_id', 'team_slug'],
  },
  {
    name: 'copilot_pr_metrics',
    uniqueColumns: ['day', 'metrics_type', 'entity_id', 'team_slug'],
  },
  {
    name: 'copilot_metrics_by_feature',
    uniqueColumns: ['day', 'metrics_type', 'entity_id', 'team_slug', 'feature'],
  },
  {
    name: 'copilot_metrics_by_ide',
    uniqueColumns: ['day', 'metrics_type', 'entity_id', 'team_slug', 'ide'],
  },
  {
    name: 'copilot_metrics_by_language_feature',
    uniqueColumns: [
      'day',
      'metrics_type',
      'entity_id',
      'team_slug',
      'language',
      'feature',
    ],
  },
  {
    name: 'copilot_metrics_by_model_feature',
    uniqueColumns: [
      'day',
      'metrics_type',
      'entity_id',
      'team_slug',
      'model_id',
      'feature',
    ],
  },
  {
    name: 'copilot_metrics_by_language_model',
    uniqueColumns: [
      'day',
      'metrics_type',
      'entity_id',
      'team_slug',
      'language',
      'model_id',
    ],
  },
  {
    name: 'copilot_metrics_by_cli',
    uniqueColumns: ['day', 'metrics_type', 'entity_id', 'team_slug'],
  },
  {
    name: 'copilot_metrics_by_vscode_agent',
    uniqueColumns: ['day', 'metrics_type', 'entity_id', 'team_slug'],
  },
];

function performanceIndexName(tableName, costCenterScoped) {
  return costCenterScoped
    ? `idx_${tableName}_type_ent_cc_team_day`
    : `idx_${tableName}_type_entity_team_day`;
}

function costCenterUniqueColumns(columns) {
  const teamSlugIndex = columns.indexOf('team_slug');
  return [
    ...columns.slice(0, teamSlugIndex + 1),
    'cost_center_id',
    'without_cost_center',
    ...columns.slice(teamSlugIndex + 1),
  ];
}

function uniqueConstraintName(tableName, costCenterScoped) {
  const scope = costCenterScoped ? 'cost_center' : 'legacy';
  return `uq_${scope}_${tableName.replace(/^copilot_/, '')}`;
}

async function dropUniqueByColumns(knex, tableName, columns) {
  const client = knex.client.config.client;
  if (client !== 'mysql' && client !== 'mysql2') {
    await knex.schema.alterTable(tableName, table => {
      table.dropUnique(columns);
    });
    return;
  }

  const result = await knex.raw('SHOW INDEX FROM ??', [tableName]);
  const indexes =
    Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
  const columnsByIndex = new Map();

  for (const index of indexes) {
    if (Number(index.Non_unique) !== 0 || index.Key_name === 'PRIMARY') {
      continue;
    }

    const indexColumns = columnsByIndex.get(index.Key_name) ?? [];
    indexColumns.push({
      column: index.Column_name,
      position: Number(index.Seq_in_index),
    });
    columnsByIndex.set(index.Key_name, indexColumns);
  }

  const uniqueName = [...columnsByIndex.entries()].find(([, indexColumns]) => {
    const orderedColumns = indexColumns
      .sort((left, right) => left.position - right.position)
      .map(entry => entry.column);
    return (
      orderedColumns.length === columns.length &&
      orderedColumns.every((column, index) => column === columns[index])
    );
  })?.[0];

  if (!uniqueName) {
    throw new Error(
      `No unique index found on ${tableName} (${columns.join(', ')})`,
    );
  }

  await knex.schema.alterTable(tableName, table => {
    table.dropUnique(columns, uniqueName);
  });
}

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  for (const aggregateTable of aggregateTables) {
    await knex.schema.alterTable(aggregateTable.name, table => {
      // GitHub cost-center IDs are non-empty, so '' remains the unscoped
      // marker. The boolean separates no-assignment aggregates from it.
      table.string('cost_center_id').notNullable().defaultTo('');
      table.boolean('without_cost_center').notNullable().defaultTo(false);
    });
    await dropUniqueByColumns(
      knex,
      aggregateTable.name,
      aggregateTable.uniqueColumns,
    );
    await knex.schema.alterTable(aggregateTable.name, table => {
      table.unique(
        costCenterUniqueColumns(aggregateTable.uniqueColumns),
        uniqueConstraintName(aggregateTable.name, true),
      );
    });

    // All aggregate reads constrain cost_center_id as well as the existing
    // entity/team/date fields, so replace rather than duplicate the old index.
    await knex.schema.alterTable(aggregateTable.name, table => {
      table.dropIndex([], performanceIndexName(aggregateTable.name, false));
      table.index(
        [
          'metrics_type',
          'entity_id',
          'cost_center_id',
          'without_cost_center',
          'team_slug',
          'day',
        ],
        performanceIndexName(aggregateTable.name, true),
      );
    });
  }

  await knex.schema.createTable('copilot_cost_centers', table => {
    table.increments('id').primary();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('cost_center_id').notNullable();
    table.string('name').notNullable();
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.unique(
      ['metrics_type', 'entity_id', 'cost_center_id'],
      'uq_cost_center_name_type_entity_id',
    );
  });

  await knex.schema.createTable('copilot_user_cost_centers', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.bigInteger('user_id').notNullable();
    table.string('user_login').notNullable();
    table.string('cost_center_id').notNullable();
    table.unique(
      ['day', 'metrics_type', 'entity_id', 'user_id'],
      'uq_user_cost_center_day_entity_user',
    );
    table.index(
      ['metrics_type', 'entity_id', 'cost_center_id', 'day', 'user_id'],
      'idx_user_cost_centers_type_entity_cc_day_user',
    );
  });

  await knex.schema.createTable(
    'copilot_cost_center_aggregation_log',
    table => {
      table.increments('id').primary();
      table.date('day').notNullable();
      table.string('metrics_type').notNullable();
      table.string('entity_id').notNullable();
      table.boolean('unassigned_complete').notNullable().defaultTo(true);
      table.boolean('needs_reaggregation').notNullable().defaultTo(false);
      table.timestamp('aggregated_at').notNullable().defaultTo(knex.fn.now());
      table.unique(
        ['day', 'metrics_type', 'entity_id'],
        'uq_cc_aggregation_log_day_entity',
      );
      table.index(
        ['metrics_type', 'entity_id', 'day'],
        'idx_cc_aggregation_log_type_entity_day',
      );
    },
  );

  await knex.schema.createTable(
    'copilot_customization_metrics_by_cost_center',
    table => {
      table.increments('id').primary();
      table.date('day').notNullable();
      table.string('metrics_type', 64).notNullable();
      table.string('entity_id', 128).notNullable();
      table.string('cost_center_id', 128).notNullable().defaultTo('');
      table.boolean('without_cost_center').notNullable().defaultTo(false);
      table.string('category', 64).notNullable();
      table.string('item_name', 128).notNullable();
      table.integer('interaction_count').notNullable();
      table.unique(
        [
          'day',
          'metrics_type',
          'entity_id',
          'cost_center_id',
          'without_cost_center',
          'category',
          'item_name',
        ],
        'uq_cc_customization_metric_scope',
      );
      table.index(
        [
          'metrics_type',
          'entity_id',
          'cost_center_id',
          'without_cost_center',
          'day',
        ],
        'idx_cc_customization_metric_type_entity_scope_day',
      );
    },
  );
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists(
    'copilot_customization_metrics_by_cost_center',
  );
  await knex.schema.dropTableIfExists('copilot_cost_center_aggregation_log');
  await knex.schema.dropTableIfExists('copilot_user_cost_centers');
  await knex.schema.dropTableIfExists('copilot_cost_centers');

  for (const aggregateTable of aggregateTables) {
    await knex.schema.alterTable(aggregateTable.name, table => {
      table.dropIndex([], performanceIndexName(aggregateTable.name, true));
    });

    // Cost-center aggregates have no equivalent key in the pre-migration
    // schema, so discard them before restoring its narrower unique key.
    await knex(aggregateTable.name).where('without_cost_center', true).del();
    await knex(aggregateTable.name).whereNot('cost_center_id', '').del();

    await knex.schema.alterTable(aggregateTable.name, table => {
      table.dropUnique(
        costCenterUniqueColumns(aggregateTable.uniqueColumns),
        uniqueConstraintName(aggregateTable.name, true),
      );
      table.dropColumn('without_cost_center');
      table.dropColumn('cost_center_id');
      if (
        knex.client.config.client === 'mysql2' ||
        knex.client.config.client === 'mysql'
      ) {
        table.unique(
          aggregateTable.uniqueColumns,
          uniqueConstraintName(aggregateTable.name, false),
        );
      } else {
        table.unique(aggregateTable.uniqueColumns);
      }
    });

    await knex.schema.alterTable(aggregateTable.name, table => {
      table.index(
        ['metrics_type', 'entity_id', 'team_slug', 'day'],
        performanceIndexName(aggregateTable.name, false),
      );
    });
  }
};
