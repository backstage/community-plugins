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
import { EntityPatchProcessor } from './EntityPatchProcessor';
import { mockServices } from '@backstage/backend-test-utils';
import { JsonObject } from '@backstage/types';
import { Entity } from '@backstage/catalog-model';

let mockFetch: jest.SpyInstance;

const mockComponentEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'payments-api',
    namespace: 'default',
    description: 'old description',
  },
  spec: { type: 'service', lifecycle: 'experimental' },
};

const componentConfig = {
  entityPatch: {
    patches: [
      {
        name: 'component-metadata',
        filter: { kind: 'component' },
        mapping: {
          'metadata.description': 'description',
          'spec.lifecycle': 'lifecycle',
        },
        sections: [{ title: 'Info', properties: {} }],
      },
    ],
  },
};

const mockCache = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
};

function makeProcessor(
  configData: JsonObject = componentConfig as unknown as JsonObject,
) {
  return EntityPatchProcessor.fromConfig(
    mockServices.rootConfig({ data: configData }),
    {
      logger: mockServices.logger.mock(),
      discovery: mockServices.discovery(),
      auth: mockServices.auth(),
    },
  );
}

beforeEach(() => {
  mockFetch = jest.spyOn(global, 'fetch');
  jest.clearAllMocks();
  mockCache.get.mockResolvedValue(undefined);
});

afterEach(() => {
  mockFetch.mockRestore();
});

describe('EntityPatchProcessor', () => {
  describe('getProcessorName', () => {
    it('returns correct name', () => {
      expect(makeProcessor().getProcessorName()).toBe('EntityPatchProcessor');
    });
  });

  describe('preProcessEntity', () => {
    it('returns entity unchanged when no patches match the entity kind', async () => {
      const groupOnlyConfig: JsonObject = {
        entityPatch: {
          patches: [
            {
              name: 'group-only',
              filter: { kind: 'group' },
              mapping: { 'metadata.description': 'description' },
              sections: [],
            },
          ],
        } as unknown as JsonObject,
      };
      const processor = makeProcessor(groupOnlyConfig);

      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result).toEqual(mockComponentEntity);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('applies saved patch data to entity using the mapping', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-abc"' : null) },
        json: async () => ({
          'component-metadata': {
            description: 'new description from patch',
            lifecycle: 'production',
          },
        }),
      });

      const processor = makeProcessor();
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result.metadata.description).toBe('new description from patch');
      expect((result.spec as any).lifecycle).toBe('production');
      // original entity is not mutated
      expect(mockComponentEntity.metadata.description).toBe('old description');
      // ETag stored in cache
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ etag: '"etag-abc"' }),
      );
    });

    it('applies bracket-notation annotation paths like metadata.annotations["pagerduty.com/integration-key"]', async () => {
      const pagerdutyConfig = {
        entityPatch: {
          patches: [
            {
              name: 'service-oncall',
              filter: { kind: 'component' },
              mapping: {
                'metadata.annotations["pagerduty.com/integration-key"]':
                  'pagerdutyKey',
                'metadata.annotations["backstage.io/runbook-url"]': 'runbook',
              },
              sections: [{ title: 'On-Call', properties: {} }],
            },
          ],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-pd"' : null) },
        json: async () => ({
          'service-oncall': {
            pagerdutyKey: 'abcdef1234567890abcdef1234567890',
            runbook: 'https://example.com/runbook',
          },
        }),
      });

      const processor = makeProcessor(pagerdutyConfig as unknown as JsonObject);
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(
        (result.metadata.annotations as Record<string, string>)[
          'pagerduty.com/integration-key'
        ],
      ).toBe('abcdef1234567890abcdef1234567890');
      expect(
        (result.metadata.annotations as Record<string, string>)[
          'backstage.io/runbook-url'
        ],
      ).toBe('https://example.com/runbook');
      // original entity is not mutated
      expect(mockComponentEntity.metadata.annotations).toBeUndefined();
    });

    it('uses cached data and sends If-None-Match when server returns 304', async () => {
      const cachedData = {
        data: { 'component-metadata': { description: 'cached description' } },
        etag: '"etag-abc"',
      };
      mockCache.get.mockResolvedValue(cachedData);
      mockFetch.mockResolvedValue({ ok: false, status: 304 });

      const processor = makeProcessor();
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result.metadata.description).toBe('cached description');
      // API was still called (with If-None-Match)
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders['If-None-Match']).toBe('"etag-abc"');
      // Cache is re-written with the existing entry so it survives the next cycle
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        cachedData,
      );
    });

    it('re-fetches and updates cache when ETag changes (data modified)', async () => {
      const cachedData = {
        data: { 'component-metadata': { description: 'old cached' } },
        etag: '"etag-old"',
      };
      mockCache.get.mockResolvedValue(cachedData);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-new"' : null) },
        json: async () => ({
          'component-metadata': { description: 'refreshed' },
        }),
      });

      const processor = makeProcessor();
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result.metadata.description).toBe('refreshed');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ etag: '"etag-new"' }),
      );
    });

    it('returns entity unchanged on API 404 (no patch data saved)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      const processor = makeProcessor();
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result).toEqual(mockComponentEntity);
    });

    it('returns entity unchanged on network error', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      const processor = makeProcessor();
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result).toEqual(mockComponentEntity);
    });

    it('skips fields where fieldName has no mapping entry', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-xyz"' : null) },
        json: async () => ({
          'component-metadata': {
            description: 'patched',
            unmappedField: 'should be ignored',
          },
        }),
      });

      const processor = makeProcessor();
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result.metadata.description).toBe('patched');
      expect((result.metadata as any).unmappedField).toBeUndefined();
    });
    it('renders Nunjucks template values using saved form data as context', async () => {
      const templateConfig: JsonObject = {
        entityPatch: {
          patches: [
            {
              name: 'service-links',
              filter: { kind: 'component' },
              mapping: {
                'metadata.annotations.runbook-url':
                  'https://wiki.example.com/runbooks/{{ service }}/{{ env }}',
                'metadata.description': 'description',
              },
              sections: [{ title: 'Links', properties: {} }],
            },
          ],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-tmpl"' : null) },
        json: async () => ({
          'service-links': {
            service: 'payments-api',
            env: 'production',
            description: 'Handles payment processing',
          },
        }),
      });

      const processor = makeProcessor(templateConfig as unknown as JsonObject);
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(
        (result.metadata.annotations as Record<string, string>)['runbook-url'],
      ).toBe('https://wiki.example.com/runbooks/payments-api/production');
      expect(result.metadata.description).toBe('Handles payment processing');
    });

    it('resolves template filters — parseEntityRef, pick, parseRepoUrl and projectSlug', async () => {
      const configWithIntegrations: JsonObject = {
        integrations: {
          github: [{ host: 'github.com' }],
        },
        entityPatch: {
          patches: [
            {
              name: 'team-ownership',
              filter: { kind: 'group' },
              mapping: {
                // parseEntityRef + pick — extract parts of an entity ref
                'spec.owner': 'owner',
                'metadata.annotations["custom/owner-name"]':
                  "{{ owner | parseEntityRef | pick('name') }}",
                'metadata.annotations["custom/owner-namespace"]':
                  "{{ owner | parseEntityRef | pick('namespace') }}",
                'metadata.annotations["custom/owner-kind"]':
                  "{{ owner | parseEntityRef | pick('kind') }}",
                // parseRepoUrl — parse a repo URL into its parts
                'metadata.annotations["custom/repo-host"]':
                  "{{ repoUrl | parseRepoUrl | pick('host') }}",
                'metadata.annotations["custom/repo-owner"]':
                  "{{ repoUrl | parseRepoUrl | pick('owner') }}",
                // projectSlug — derive "owner/repo" from a repo URL
                'metadata.annotations["custom/project-slug"]':
                  '{{ repoUrl | projectSlug }}',
              },
              sections: [{ title: 'Ownership', properties: {} }],
            },
          ],
        },
      };

      const groupEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        metadata: { name: 'platform-team', namespace: 'default' },
        spec: { type: 'team', children: [] },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (h: string) => (h === 'etag' ? '"etag-filters"' : null),
        },
        json: async () => ({
          'team-ownership': {
            owner: 'group:default/guests',
            repoUrl: 'github.com?owner=my-org&repo=my-service',
          },
        }),
      });

      const processor = makeProcessor(configWithIntegrations);
      const result = await processor.preProcessEntity(
        groupEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      const annotations = result.metadata.annotations as Record<string, string>;

      // parseEntityRef | pick
      expect((result.spec as any).owner).toBe('group:default/guests');
      expect(annotations['custom/owner-name']).toBe('guests');
      expect(annotations['custom/owner-namespace']).toBe('default');
      expect(annotations['custom/owner-kind']).toBe('group');

      // parseRepoUrl | pick
      expect(annotations['custom/repo-host']).toBe('github.com');
      expect(annotations['custom/repo-owner']).toBe('my-org');

      // projectSlug
      expect(annotations['custom/project-slug']).toBe('my-org/my-service');
    });

    it('supports fan-out: writes same field value to multiple entity paths', async () => {
      const fanOutConfig: JsonObject = {
        entityPatch: {
          patches: [
            {
              name: 'group-details',
              filter: { kind: 'group' },
              mapping: {
                'metadata.description': 'description',
                'metadata.annotations.custom/description': 'description', // fan-out
              },
              sections: [{ title: 'Details', properties: {} }],
            },
          ],
        },
      };

      const groupEntity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Group',
        metadata: { name: 'my-team', namespace: 'default' },
        spec: { type: 'team', children: [] },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-fo"' : null) },
        json: async () => ({
          'group-details': { description: 'Great team' },
        }),
      });

      const processor = makeProcessor(fanOutConfig as unknown as JsonObject);
      const result = await processor.preProcessEntity(
        groupEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result.metadata.description).toBe('Great team');
      expect(
        (result.metadata.annotations as Record<string, string>)[
          'custom/description'
        ],
      ).toBe('Great team');
    });

    it('skips relation-mapped fields in preProcessEntity (they are handled in postProcessEntity)', async () => {
      const relationsConfig: JsonObject = {
        entityPatch: {
          relations: [
            { name: 'designer', forward: 'hasDesigner', reverse: 'designerOn' },
          ],
          patches: [
            {
              name: 'component-metadata',
              filter: { kind: 'component' },
              mapping: {
                'metadata.description': 'description',
                'relations.hasDesigner': 'designers',
              },
              sections: [
                {
                  properties: {
                    description: { type: 'string' },
                    designers: { type: 'array' },
                  },
                },
              ],
            },
          ],
        } as unknown as JsonObject,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-rel"' : null) },
        json: async () => ({
          'component-metadata': {
            description: 'patched description',
            designers: ['user:default/alice'],
          },
        }),
      });

      const processor = makeProcessor(relationsConfig);
      const result = await processor.preProcessEntity(
        mockComponentEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );

      expect(result.metadata.description).toBe('patched description');
      // relation field must NOT be written as a scalar path
      expect((result as any).relations).toBeUndefined();
    });
  });

  describe('postProcessEntity', () => {
    const groupEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: 'my-team', namespace: 'default' },
      spec: { type: 'team', children: [] },
    };

    const relationsConfig: JsonObject = {
      entityPatch: {
        relations: [
          { name: 'designer', forward: 'hasDesigner', reverse: 'designerOn' },
          { name: 'techLead', forward: 'hasTechLead', reverse: 'techLeadOf' },
        ],
        patches: [
          {
            name: 'team-roles',
            filter: { kind: 'group' },
            mapping: {
              'relations.hasDesigner': 'designers',
              'relations.hasTechLead': 'techLeads',
            },
            sections: [
              {
                properties: {
                  designers: { type: 'array' },
                  techLeads: { type: 'array' },
                },
              },
            ],
          },
        ],
      } as unknown as JsonObject,
    };

    it('emits forward and reverse relations for each stored ref', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-team"' : null) },
        json: async () => ({
          'team-roles': {
            designers: ['user:default/alice', 'user:default/bob'],
          },
        }),
      });

      const emitted: any[] = [];
      const emit = (result: any) => emitted.push(result);

      const processor = makeProcessor(relationsConfig);
      // pre populates cycleData; post reads from it (no second network call)
      await processor.preProcessEntity(
        groupEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );
      await processor.postProcessEntity(
        groupEntity,
        {} as any,
        emit,
        mockCache as any,
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(emitted).toHaveLength(4); // 2 refs × 2 directions
      expect(emitted).toContainEqual(
        expect.objectContaining({
          type: 'relation',
          relation: expect.objectContaining({
            type: 'hasDesigner',
            source: expect.objectContaining({ name: 'my-team' }),
            target: expect.objectContaining({ name: 'alice' }),
          }),
        }),
      );
      expect(emitted).toContainEqual(
        expect.objectContaining({
          type: 'relation',
          relation: expect.objectContaining({
            type: 'designerOn',
            source: expect.objectContaining({ name: 'alice' }),
            target: expect.objectContaining({ name: 'my-team' }),
          }),
        }),
      );
    });

    it('emits nothing when no patch data is saved', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      const emitted: any[] = [];
      const processor = makeProcessor(relationsConfig);
      // pre sets cycleData to null (404); post reads null and emits nothing
      await processor.preProcessEntity(
        groupEntity,
        {} as any,
        () => {},
        {} as any,
        mockCache as any,
      );
      await processor.postProcessEntity(
        groupEntity,
        {} as any,
        (r: any) => emitted.push(r),
        mockCache as any,
      );

      expect(emitted).toHaveLength(0);
    });

    it('returns entity unchanged and emits nothing when no patches match', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h === 'etag' ? '"etag-x"' : null) },
        json: async () => ({
          'team-roles': { designers: ['user:default/alice'] },
        }),
      });

      const emitted: any[] = [];
      const processor = makeProcessor(relationsConfig);
      await processor.postProcessEntity(
        mockComponentEntity, // kind: Component — does not match group filter
        {} as any,
        (r: any) => emitted.push(r),
        mockCache as any,
      );

      expect(emitted).toHaveLength(0);
    });
  });
});
