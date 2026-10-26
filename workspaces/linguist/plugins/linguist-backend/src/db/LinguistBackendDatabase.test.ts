/*
 * Copyright 2021 The Backstage Authors
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

import { Knex as KnexType, Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import { TestDatabases } from '@backstage/backend-test-utils';
import {
  LinguistBackendDatabase,
  LinguistBackendStore,
} from './LinguistBackendDatabase';
import {
  Languages,
  ProcessedEntity,
} from '@backstage-community/plugin-linguist-common';

function createDatabaseManager(
  client: KnexType,
  skipMigrations: boolean = false,
) {
  return {
    getClient: async () => client,
    migrations: {
      skip: skipMigrations,
    },
  };
}

const rawDbEntityResultRows = [
  {
    id: '14b32439-848a-49b2-92a4-98753f932606',
    entity_ref: 'template:default/create-react-app-template',
    languages: undefined,
    processed_date: undefined,
  },
  {
    id: '8c85d3ec-ccea-4b29-9de9-ccdd7e5ba452',
    entity_ref: 'template:default/docs-template',
    languages: undefined,
    processed_date: undefined,
  },
  {
    id: 'b922c87b-37bc-4505-b4af-70a1438decda',
    entity_ref: 'template:default/pull-request',
    languages:
      '{"languageCount":1,"totalBytes":2205,"processedDate":"2023-02-15T20:10:21.378Z","breakdown":[{"name":"YAML","percentage":100,"bytes":2205,"type":"data","color":"#cb171e"}]}',
    processed_date: new Date('2023-02-15 20:10:21.378Z'),
  },
  {
    id: 'bd555e6d-a3d0-4b48-a930-194db8f80db7',
    entity_ref: 'template:default/react-ssr-template',
    languages:
      '{"languageCount":8,"totalBytes":8988,"processedDate":"2023-02-15T20:10:21.388Z","breakdown":[{"name":"INI","percentage":2.26,"bytes":203,"type":"data","color":"#d1dbe0"},{"name":"JavaScript","percentage":5.94,"bytes":534,"type":"programming","color":"#f1e05a"},{"name":"YAML","percentage":31.09,"bytes":2794,"type":"data","color":"#cb171e"},{"name":"Markdown","percentage":11.79,"bytes":1060,"type":"prose","color":"#083fa1"},{"name":"JSON","percentage":21.09,"bytes":1896,"type":"data","color":"#292929"},{"name":"CSS","percentage":0,"bytes":0,"type":"markup","color":"#563d7c"},{"name":"TSX","percentage":26.01,"bytes":2338,"type":"programming","color":"#3178c6"},{"name":"TypeScript","percentage":1.81,"bytes":163,"type":"programming","color":"#3178c6"}]}',
    processed_date: new Date('2023-02-15 20:10:21.388Z'),
  },
  {
    id: '4145c0cf-44e9-4e95-9d57-781af4685b28',
    entity_ref: 'template:default/springboot-template',
    languages:
      '{"languageCount":9,"totalBytes":80986,"processedDate":"2023-02-15T20:10:21.419Z","breakdown":[{"name":"Shell","percentage":0.16,"bytes":130,"type":"programming","color":"#89e051"},{"name":"INI","percentage":0.35,"bytes":286,"type":"data","color":"#d1dbe0"},{"name":"Dockerfile","percentage":0.3,"bytes":246,"type":"programming","color":"#384d54"},{"name":"YAML","percentage":3.92,"bytes":3171,"type":"data","color":"#cb171e"},{"name":"Markdown","percentage":1.31,"bytes":1059,"type":"prose","color":"#083fa1"},{"name":"XML","percentage":10.48,"bytes":8491,"type":"data","color":"#0060ac"},{"name":"Java","percentage":1.8,"bytes":1455,"type":"programming","color":"#b07219"},{"name":"Text","percentage":81.22,"bytes":65780,"type":"prose"},{"name":"Protocol Buffer","percentage":0.45,"bytes":368,"type":"data"}]}',
    processed_date: new Date('2023-02-15 20:10:21.419Z'),
  },
];

describe('Linguist database', () => {
  const databases = TestDatabases.create();
  let store: LinguistBackendStore;
  let testDbClient: Knex<any, unknown[]>;
  beforeAll(async () => {
    testDbClient = await databases.init('SQLITE_3');
    const database = createDatabaseManager(testDbClient);

    store = await LinguistBackendDatabase.create(await database.getClient());
  });
  beforeEach(async () => {
    await testDbClient.batchInsert('entity_result', rawDbEntityResultRows);
  });
  afterEach(async () => {
    await testDbClient('entity_result').delete();
  });

  it('should be able to return entity results', async () => {
    const validLanguagesResult: Languages = {
      languageCount: 1,
      totalBytes: 2205,
      processedDate: '2023-02-15T20:10:21.378Z',
      breakdown: [
        {
          name: 'YAML',
          percentage: 100,
          bytes: 2205,
          type: 'data',
          color: '#cb171e',
        },
      ],
    };

    const entityResult = await store.getEntityResults(
      'template:default/pull-request',
    );
    expect(entityResult).toMatchObject(validLanguagesResult);
  });

  it('should return empty entity results when not found', async () => {
    const validEmptyLanguagesResult: Languages = {
      languageCount: 0,
      totalBytes: 0,
      processedDate: 'undefined',
      breakdown: [],
    };

    const entityResult = await store.getEntityResults(
      'template:default/create-react-app-template',
    );
    expect(entityResult).toMatchObject(validEmptyLanguagesResult);
  });

  it('should be able to return unprocessed entities', async () => {
    const validUnprocessedEntities: string[] = [
      'template:default/create-react-app-template',
      'template:default/docs-template',
    ];

    const unprocessedEntities = await store.getUnprocessedEntities();

    expect(unprocessedEntities).toMatchObject(validUnprocessedEntities);
  });

  it('should return string[] when there is no unprocessed entities', async () => {
    await testDbClient('entity_result').delete();
    const unprocessedEntities = await store.getUnprocessedEntities();

    expect(unprocessedEntities).toMatchObject([]);
  });

  it('should be able to return processed entities', async () => {
    const validProcessedEntities: ProcessedEntity[] = [
      {
        entityRef: 'template:default/pull-request',
        processedDate: new Date('2023-02-15 20:10:21.378Z'),
      },
      {
        entityRef: 'template:default/react-ssr-template',
        processedDate: new Date('2023-02-15 20:10:21.388Z'),
      },
      {
        entityRef: 'template:default/springboot-template',
        processedDate: new Date('2023-02-15 20:10:21.419Z'),
      },
    ];

    const processedEntities = await store.getProcessedEntities();

    expect(processedEntities).toMatchObject(validProcessedEntities);
  });

  it('should return string[] when there is no processed entities', async () => {
    await testDbClient('entity_result').delete();
    const unprocessedEntities = await store.getProcessedEntities();

    expect(unprocessedEntities).toMatchObject([]);
  });

  it('should insert new entities and ignore duplicates', async () => {
    const before = testDbClient.from('entity_result').count();

    await store.insertNewEntity('component:/default/new-entity-one');
    await store.insertNewEntity('component:/default/new-entity-two');
    await store.insertNewEntity('template:default/pull-request');

    const after = testDbClient.from('entity_result').count();

    expect(before).toEqual(after);
  });

  it('should mark entities processed without losing existing results', async () => {
    const processedDate = new Date('2023-02-20T20:10:21.378Z');
    const previousResults = await store.getEntityResults(
      'template:default/pull-request',
    );

    await store.markEntityProcessed(
      'template:default/create-react-app-template',
      processedDate,
    );
    await store.markEntityProcessed(
      'template:default/pull-request',
      processedDate,
    );

    // The failed/never-analysed entity keeps null languages, so it stays in the
    // unprocessed set. Having a processed_date now orders it after the
    // still-never-processed docs-template.
    expect(await store.getUnprocessedEntities()).toEqual([
      'template:default/docs-template',
      'template:default/create-react-app-template',
    ]);

    // The previously analysed entity keeps its original languages value.
    expect(
      await store.getEntityResults('template:default/pull-request'),
    ).toEqual(previousResults);

    // Both rows receive the supplied processed_date.
    const rows = await testDbClient
      .from('entity_result')
      .whereIn('entity_ref', [
        'template:default/create-react-app-template',
        'template:default/pull-request',
      ]);
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      // SQLite returns a timestamp, Postgres returns a Date; normalise both.
      const rowDate = isNaN(+row.processed_date)
        ? new Date(row.processed_date)
        : new Date(+row.processed_date);
      expect(rowDate).toEqual(processedDate);
    }
  });

  it('should order unprocessed entities by processed_date with nulls first', async () => {
    // Validates: Requirements 2.2, 2.3 (Property 3).
    // Seed additional null-languages rows mixing null and varied non-null
    // processed_date values. The two rows from the shared seed
    // (create-react-app-template, docs-template) are also null-languages with a
    // null processed_date, so the returned queue blends all of them.
    const nullDatedNeverProcessed = {
      id: 'f0000000-0000-4000-8000-000000000001',
      entity_ref: 'component:default/never-processed',
      languages: undefined,
      processed_date: undefined,
    };
    const failedEarlier = {
      id: 'f0000000-0000-4000-8000-000000000002',
      entity_ref: 'component:default/failed-earlier',
      languages: undefined,
      processed_date: new Date('2023-01-01 10:00:00.000Z'),
    };
    const failedLater = {
      id: 'f0000000-0000-4000-8000-000000000003',
      entity_ref: 'component:default/failed-later',
      languages: undefined,
      processed_date: new Date('2023-06-01 10:00:00.000Z'),
    };
    await testDbClient.batchInsert('entity_result', [
      // Insert the dated (previously failed) rows before the never-processed
      // one so insertion order cannot accidentally satisfy the invariant.
      failedLater,
      failedEarlier,
      nullDatedNeverProcessed,
    ]);

    const unprocessedEntities = await store.getUnprocessedEntities();

    // Map each returned ref back to its seeded processed_date (null for
    // never-processed rows) so we can check the relative-order invariant.
    const datesByRef = new Map<string, Date | undefined>([
      ['template:default/create-react-app-template', undefined],
      ['template:default/docs-template', undefined],
      [nullDatedNeverProcessed.entity_ref, undefined],
      [failedEarlier.entity_ref, failedEarlier.processed_date],
      [failedLater.entity_ref, failedLater.processed_date],
    ]);

    const orderedDates = unprocessedEntities.map(ref => datesByRef.get(ref));

    // Sanity: every seeded null-languages row is present.
    expect(unprocessedEntities).toHaveLength(datesByRef.size);

    // Invariant 1: no non-null-dated entity precedes a null-dated one. The
    // array must be partitioned null-dated-first, so the position of the last
    // null-dated entry must come before the first non-null-dated entry.
    const firstDatedIndex = orderedDates.findIndex(date => date !== undefined);
    const boundary =
      firstDatedIndex === -1 ? orderedDates.length : firstDatedIndex;
    const nullsThenDates = orderedDates.map(
      (date, index) => index < boundary === (date === undefined),
    );
    expect(nullsThenDates.every(Boolean)).toBe(true);

    // Invariant 2: non-null dates appear in non-decreasing order.
    const datedTimestamps = orderedDates
      .filter((date): date is Date => date !== undefined)
      .map(date => date.getTime());
    const sortedTimestamps = [...datedTimestamps].sort((a, b) => a - b);
    expect(datedTimestamps).toEqual(sortedTimestamps);
  });

  it('should return exactly the null-languages entities as unprocessed', async () => {
    // Validates: Requirements 2.1 (Property 2).
    // Seed extra rows mixing null and non-null languages on top of the shared
    // seed, then assert the unprocessed queue is exactly the set of
    // null-languages refs, regardless of processed_date or order.
    const extraNullLanguages = [
      {
        id: 'a0000000-0000-4000-8000-000000000001',
        entity_ref: 'component:default/extra-null-never-processed',
        languages: undefined,
        processed_date: undefined,
      },
      {
        id: 'a0000000-0000-4000-8000-000000000002',
        entity_ref: 'component:default/extra-null-failed',
        languages: undefined,
        processed_date: new Date('2023-03-01 10:00:00.000Z'),
      },
    ];
    const extraNonNullLanguages = [
      {
        id: 'a0000000-0000-4000-8000-000000000003',
        entity_ref: 'component:default/extra-analysed',
        languages:
          '{"languageCount":0,"totalBytes":0,"processedDate":"2023-03-02T10:00:00.000Z","breakdown":[]}',
        processed_date: new Date('2023-03-02 10:00:00.000Z'),
      },
    ];
    await testDbClient.batchInsert('entity_result', [
      ...extraNullLanguages,
      ...extraNonNullLanguages,
    ]);

    const unprocessedEntities = await store.getUnprocessedEntities();

    // Expected = every seeded row whose languages column is null, from both the
    // shared seed and the extra rows. Compare as sets so ordering is irrelevant.
    const expectedNullLanguageRefs = [
      ...rawDbEntityResultRows,
      ...extraNullLanguages,
      ...extraNonNullLanguages,
    ]
      .filter(row => row.languages === undefined)
      .map(row => row.entity_ref);

    expect(unprocessedEntities.slice().sort()).toEqual(
      expectedNullLanguageRefs.slice().sort(),
    );
  });

  it('should set the processed_date and preserve languages across many rows and dates', async () => {
    // Validates: Requirements 1.1, 1.2, 1.3 (Property 1).
    //
    // For any entity row and any date, after markEntityProcessed(ref, date) the
    // row's processed_date equals the supplied date and its languages value is
    // unchanged: a null languages stays null, a non-null languages keeps its
    // exact prior value.
    //
    // fast-check is not available in this workspace, so this is a generative
    // table-driven test: it enumerates the two meaningful languages states
    // (null and a representative non-null JSON value) crossed with a spread of
    // dates (epoch, a past date, "now", and a far-future date) and a null prior
    // processed_date, and asserts the property holds for every combination.
    const nonNullLanguages =
      '{"languageCount":1,"totalBytes":2205,"processedDate":"2023-02-15T20:10:21.378Z","breakdown":[{"name":"YAML","percentage":100,"bytes":2205,"type":"data","color":"#cb171e"}]}';

    const languagesStates: Array<string | undefined> = [
      undefined,
      nonNullLanguages,
    ];
    const priorProcessedDates: Array<Date | undefined> = [
      undefined,
      new Date('2023-02-15 20:10:21.378Z'),
    ];
    const suppliedDates: Date[] = [
      new Date(0),
      new Date('2020-07-04 12:34:56.000Z'),
      new Date('2023-02-20T20:10:21.378Z'),
      new Date('2099-12-31 23:59:59.000Z'),
    ];

    // Normalise the raw processed_date column: SQLite returns a timestamp,
    // Postgres returns a Date. Matches the pattern used elsewhere in this file.
    const normaliseDate = (value: any): Date =>
      isNaN(+value) ? new Date(value) : new Date(+value);

    let caseIndex = 0;
    for (const priorLanguages of languagesStates) {
      for (const priorProcessedDate of priorProcessedDates) {
        for (const suppliedDate of suppliedDates) {
          // Start each case from a clean table so cases are independent of the
          // shared seed and of one another.
          await testDbClient('entity_result').delete();

          const entityRef = `component:default/prop-case-${caseIndex}`;
          caseIndex += 1;

          await testDbClient('entity_result').insert({
            id: uuid(),
            entity_ref: entityRef,
            languages: priorLanguages,
            processed_date: priorProcessedDate,
          });

          await store.markEntityProcessed(entityRef, suppliedDate);

          const row = await testDbClient
            .from('entity_result')
            .where({ entity_ref: entityRef })
            .first();

          const context = `languages=${
            priorLanguages === undefined ? 'null' : 'non-null'
          }, priorDate=${
            priorProcessedDate?.toISOString() ?? 'null'
          }, date=${suppliedDate.toISOString()}`;

          // processed_date equals the supplied date.
          expect({
            context,
            date: normaliseDate(row.processed_date).getTime(),
          }).toEqual({ context, date: suppliedDate.getTime() });

          // languages is unchanged: null stays null, non-null keeps its value.
          const observedLanguages =
            row.languages === null ? undefined : row.languages;
          expect({ context, languages: observedLanguages }).toEqual({
            context,
            languages: priorLanguages,
          });
        }
      }
    }
  });

  it('should get all entities', async () => {
    const allEntities = await store.getAllEntities();

    expect(allEntities.length).toEqual(5);
  });

  it('should delete entity by its entityRef', async () => {
    const before = await testDbClient.from('entity_result').count();

    await store.deleteEntity('template:default/create-react-app-template');

    const after = await testDbClient.from('entity_result').count();

    expect(before).toEqual([{ 'count(*)': 5 }]);
    expect(after).toEqual([{ 'count(*)': 4 }]);
  });
});
