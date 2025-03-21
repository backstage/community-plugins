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
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // get rows with duplicte day, type and team_name WHERE team_name is null
  const rows = await knex('copilot_metrics')
    .select(
      'day',
      'type',
      'team_name',
      'total_engaged_users',
      'total_active_users',
    )
    .where('team_name', null)
    .groupBy(
      'day',
      'type',
      'team_name',
      'total_engaged_users',
      'total_active_users',
    )
    .havingRaw('count(*) > 1');

  // if we found any rows:
  // 1. Delete the nulls
  // 2. Insert a new row with the same day, type and team_name = ''
  if (rows.length > 0) {
    for (const row of rows) {
      // first delete all the null rows
      await knex('copilot_metrics')
        .where('day', row.day)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('copilot_metrics')
        .insert({
          day: row.day,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
          total_active_users: row.total_active_users,
        })
        .onConflict(['day', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('copilot_metrics')
    .where('team_name', null)
    .update({ team_name: '' });

  // ide_completions
  const ideCompletionsRows = await knex('ide_completions')
    .select('day', 'type', 'team_name', 'total_engaged_users')
    .where('team_name', null)
    .groupBy('day', 'type', 'team_name', 'total_engaged_users')
    .havingRaw('count(*) > 1');

  if (ideCompletionsRows.length > 0) {
    for (const row of ideCompletionsRows) {
      // first delete all the null rows
      await knex('ide_completions')
        .where('day', row.day)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('ide_completions')
        .insert({
          day: row.day,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('ide_completions')
    .where('team_name', null)
    .update({ team_name: '' });

  // ide_completions_language_users
  const ideLangUsersRows = await knex('ide_completions_language_users')
    .select('day', 'language', 'type', 'team_name', 'total_engaged_users')
    .where('team_name', null)
    .groupBy('day', 'language', 'type', 'team_name', 'total_engaged_users')
    .havingRaw('count(*) > 1');

  if (ideLangUsersRows.length > 0) {
    for (const row of ideLangUsersRows) {
      // first delete all the null rows
      await knex('ide_completions_language_users')
        .where('day', row.day)
        .where('language', row.language)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('ide_completions_language_users')
        .insert({
          day: row.day,
          language: row.language,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'language', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('ide_completions_language_users')
    .where('team_name', null)
    .update({ team_name: '' });

  // ide_completions_language_editors
  const ideLangEditorsRows = await knex('ide_completions_language_editors')
    .select('day', 'editor', 'type', 'team_name', 'total_engaged_users')
    .where('team_name', null)
    .groupBy('day', 'editor', 'type', 'team_name', 'total_engaged_users')
    .havingRaw('count(*) > 1');

  if (ideLangEditorsRows.length > 0) {
    for (const row of ideLangEditorsRows) {
      // first delete all the null rows
      await knex('ide_completions_language_editors')
        .where('day', row.day)
        .where('editor', row.editor)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('ide_completions_language_editors')
        .insert({
          day: row.day,
          editor: row.editor,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'editor', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('ide_completions_language_editors')
    .where('team_name', null)
    .update({ team_name: '' });

  // ide_completions_language_editors_model
  const ideLangEditorsModelRows = await knex(
    'ide_completions_language_editors_model',
  )
    .select(
      'day',
      'editor',
      'model',
      'type',
      'team_name',
      'total_engaged_users',
    )
    .where('team_name', null)
    .groupBy(
      'day',
      'editor',
      'model',
      'type',
      'team_name',
      'total_engaged_users',
    )
    .havingRaw('count(*) > 1');

  if (ideLangEditorsModelRows.length > 0) {
    for (const row of ideLangEditorsModelRows) {
      // first delete all the null rows
      await knex('ide_completions_language_editors_model')
        .where('day', row.day)
        .where('editor', row.editor)
        .where('model', row.model)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('ide_completions_language_editors_model')
        .insert({
          day: row.day,
          editor: row.editor,
          model: row.model,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'editor', 'model', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('ide_completions_language_editors_model')
    .where('team_name', null)
    .update({ team_name: '' });

  // ide_completions_language_editors_model_language
  const ideLangEditorsModelLangRows = await knex(
    'ide_completions_language_editors_model_language',
  )
    .select(
      'day',
      'editor',
      'model',
      'language',
      'type',
      'team_name',
      'total_engaged_users',
      'total_code_acceptances',
      'total_code_suggestions',
      'total_code_lines_accepted',
      'total_code_lines_suggested',
    )
    .where('team_name', null)
    .groupBy(
      'day',
      'editor',
      'model',
      'language',
      'type',
      'team_name',
      'total_engaged_users',
      'total_code_acceptances',
      'total_code_suggestions',
      'total_code_lines_accepted',
      'total_code_lines_suggested',
    )
    .havingRaw('count(*) > 1');

  if (ideLangEditorsModelLangRows.length > 0) {
    for (const row of ideLangEditorsModelLangRows) {
      // first delete all the null rows
      await knex('ide_completions_language_editors_model_language')
        .where('day', row.day)
        .where('editor', row.editor)
        .where('model', row.model)
        .where('language', row.language)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('ide_completions_language_editors_model_language')
        .insert({
          day: row.day,
          editor: row.editor,
          model: row.model,
          language: row.language,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
          total_code_acceptances: row.total_code_acceptances,
          total_code_suggestions: row.total_code_suggestions,
          total_code_lines_accepted: row.total_code_lines_accepted,
          total_code_lines_suggested: row.total_code_lines_suggested,
        })
        .onConflict(['day', 'editor', 'model', 'language', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('ide_completions_language_editors_model_language')
    .where('team_name', null)
    .update({ team_name: '' });

  // ide_chats
  const ideChatsRows = await knex('ide_chats')
    .select('day', 'type', 'team_name', 'total_engaged_users')
    .where('team_name', null)
    .groupBy('day', 'type', 'team_name', 'total_engaged_users')
    .havingRaw('count(*) > 1');

  if (ideChatsRows.length > 0) {
    for (const row of ideChatsRows) {
      // first delete all the null rows
      await knex('ide_chats')
        .where('day', row.day)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('ide_chats')
        .insert({
          day: row.day,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('ide_chats').where('team_name', null).update({ team_name: '' });

  // ide_chat_editors
  const ideChatEditorsRows = await knex('ide_chat_editors')
    .select('day', 'editor', 'type', 'team_name', 'total_engaged_users')
    .where('team_name', null)
    .groupBy('day', 'editor', 'type', 'team_name', 'total_engaged_users')
    .havingRaw('count(*) > 1');

  if (ideChatEditorsRows.length > 0) {
    for (const row of ideChatEditorsRows) {
      // first delete all the null rows
      await knex('ide_chat_editors')
        .where('day', row.day)
        .where('editor', row.editor)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('ide_chat_editors')
        .insert({
          day: row.day,
          editor: row.editor,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'editor', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('ide_chat_editors')
    .where('team_name', null)
    .update({ team_name: '' });

  // ide_chat_editors_model
  const ideChatEditorsModelRows = await knex('ide_chat_editors_model')
    .select(
      'day',
      'editor',
      'model',
      'type',
      'team_name',
      'total_engaged_users',
      'total_chat_copy_events',
      'total_chat_insertion_events',
      'total_chats',
    )
    .where('team_name', null)
    .groupBy(
      'day',
      'editor',
      'model',
      'type',
      'team_name',
      'total_engaged_users',
      'total_chat_copy_events',
      'total_chat_insertion_events',
      'total_chats',
    )
    .havingRaw('count(*) > 1');

  if (ideChatEditorsModelRows.length > 0) {
    for (const row of ideChatEditorsModelRows) {
      // first delete all the null rows
      await knex('ide_chat_editors_model')
        .where('day', row.day)
        .where('editor', row.editor)
        .where('model', row.model)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('ide_chat_editors_model')
        .insert({
          day: row.day,
          editor: row.editor,
          model: row.model,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
          total_chat_copy_events: row.total_chat_copy_events,
          total_chat_insertion_events: row.total_chat_insertion_events,
          total_chats: row.total_chats,
        })
        .onConflict(['day', 'editor', 'model', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('ide_chat_editors_model')
    .where('team_name', null)
    .update({ team_name: '' });

  // dotcom_chats
  const dotcomChatsRows = await knex('dotcom_chats')
    .select('day', 'type', 'team_name', 'total_engaged_users')
    .where('team_name', null)
    .groupBy('day', 'type', 'team_name', 'total_engaged_users')
    .havingRaw('count(*) > 1');

  if (dotcomChatsRows.length > 0) {
    for (const row of dotcomChatsRows) {
      // first delete all the null rows
      await knex('dotcom_chats')
        .where('day', row.day)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('dotcom_chats')
        .insert({
          day: row.day,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('dotcom_chats').where('team_name', null).update({ team_name: '' });

  // dotcom_chat_models
  const dotcomChatModelsRows = await knex('dotcom_chat_models')
    .select(
      'day',
      'model',
      'type',
      'team_name',
      'total_engaged_users',
      'total_chats',
    )
    .where('team_name', null)
    .groupBy(
      'day',
      'model',
      'type',
      'team_name',
      'total_engaged_users',
      'total_chats',
    )
    .havingRaw('count(*) > 1');

  if (dotcomChatModelsRows.length > 0) {
    for (const row of dotcomChatModelsRows) {
      // first delete all the null rows
      await knex('dotcom_chat_models')
        .where('day', row.day)
        .where('model', row.model)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('dotcom_chat_models')
        .insert({
          day: row.day,
          model: row.model,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
          total_chats: row.total_chats,
        })
        .onConflict(['day', 'model', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('dotcom_chat_models')
    .where('team_name', null)
    .update({ team_name: '' });

  // dotcom_prs
  const dotcomPrsRows = await knex('dotcom_prs')
    .select('day', 'type', 'team_name', 'total_engaged_users')
    .where('team_name', null)
    .groupBy('day', 'type', 'team_name', 'total_engaged_users')
    .havingRaw('count(*) > 1');

  if (dotcomPrsRows.length > 0) {
    for (const row of dotcomPrsRows) {
      // first delete all the null rows
      await knex('dotcom_prs')
        .where('day', row.day)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('dotcom_prs')
        .insert({
          day: row.day,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'type', 'team_name'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('dotcom_prs').where('team_name', null).update({ team_name: '' });

  // dotcom_pr_repositories
  const dotcomPrReposRows = await knex('dotcom_pr_repositories')
    .select('day', 'repository', 'type', 'team_name', 'total_engaged_users')
    .where('team_name', null)
    .groupBy('day', 'repository', 'type', 'team_name', 'total_engaged_users')
    .havingRaw('count(*) > 1');

  if (dotcomPrReposRows.length > 0) {
    for (const row of dotcomPrReposRows) {
      // first delete all the null rows
      await knex('dotcom_pr_repositories')
        .where('day', row.day)
        .where('repository', row.repository)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('dotcom_pr_repositories')
        .insert({
          day: row.day,
          repository: row.repository,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
        })
        .onConflict(['day', 'type', 'team_name', 'repository'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('dotcom_pr_repositories')
    .where('team_name', null)
    .update({ team_name: '' });

  // dotcom_pr_repositories_models
  const dotcomPrReposModelsRows = await knex('dotcom_pr_repositories_models')
    .select(
      'day',
      'repository',
      'model',
      'type',
      'team_name',
      'total_engaged_users',
      'total_pr_summaries',
    )
    .where('team_name', null)
    .groupBy(
      'day',
      'repository',
      'model',
      'type',
      'team_name',
      'total_engaged_users',
      'total_pr_summaries',
    )
    .havingRaw('count(*) > 1');

  if (dotcomPrReposModelsRows.length > 0) {
    for (const row of dotcomPrReposModelsRows) {
      // first delete all the null rows
      await knex('dotcom_pr_repositories_models')
        .where('day', row.day)
        .where('repository', row.repository)
        .where('model', row.model)
        .where('type', row.type)
        .where('team_name', null)
        .delete();

      // then insert ONE new with team_name = ''
      await knex('dotcom_pr_repositories_models')
        .insert({
          day: row.day,
          repository: row.repository,
          model: row.model,
          type: row.type,
          team_name: '',
          total_engaged_users: row.total_engaged_users,
          total_pr_summaries: row.total_pr_summaries,
        })
        .onConflict(['day', 'type', 'team_name', 'repository', 'model'])
        .ignore();
    }
  }

  // lastly: we need to update all nulls to empty strings
  await knex('dotcom_pr_repositories_models')
    .where('team_name', null)
    .update({ team_name: '' });

  // finally, update all the team_name columns to not null
  await knex.schema.table('copilot_metrics', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_completions', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_completions_language_users', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_completions_language_editors', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_completions_language_editors_model', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table(
    'ide_completions_language_editors_model_language',
    table => {
      table.string('team_name').notNullable().alter();
    },
  );
  await knex.schema.table('ide_chats', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_chat_editors', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('ide_chat_editors_model', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_chats', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_chat_models', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_prs', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_pr_repositories', table => {
    table.string('team_name').notNullable().alter();
  });
  await knex.schema.table('dotcom_pr_repositories_models', table => {
    table.string('team_name').notNullable().alter();
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  // a reverse migration is to update all the team_name columns to nullable
  await knex.schema.table('copilot_metrics', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_completions', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_completions_language_users', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_completions_language_editors', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_completions_language_editors_model', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table(
    'ide_completions_language_editors_model_language',
    table => {
      table.string('team_name').nullable().alter();
    },
  );
  await knex.schema.table('ide_chats', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_chat_editors', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('ide_chat_editors_model', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_chats', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_chat_models', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_prs', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_pr_repositories', table => {
    table.string('team_name').nullable().alter();
  });
  await knex.schema.table('dotcom_pr_repositories_models', table => {
    table.string('team_name').nullable().alter();
  });

  // Then update all the rows with team_name = '' to null
  // This makes all duplicates gone, but the possibillity of having
  // more duplicates until the next migration
  await knex('copilot_metrics')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions_language_users')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions_language_editors')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions_language_editors_model')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_completions_language_editors_model_language')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_chats').where('team_name', '').update({ team_name: null });
  await knex('ide_chat_editors')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('ide_chat_editors_model')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('dotcom_chats').where('team_name', '').update({ team_name: null });
  await knex('dotcom_chat_models')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('dotcom_prs').where('team_name', '').update({ team_name: null });
  await knex('dotcom_pr_repositories')
    .where('team_name', '')
    .update({ team_name: null });
  await knex('dotcom_pr_repositories_models')
    .where('team_name', '')
    .update({ team_name: null });
};
