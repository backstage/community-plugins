import { MockFetchApi } from '@backstage/test-utils';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { CicdStatisticsApiBuildkite, BuildkiteClient } from './buildkite';
import { BuildkiteApi } from '@roadiehq/backstage-plugin-buildkite';
import { Entity } from '@backstage/catalog-model';
import { Build, CicdState } from '@backstage-community/plugin-cicd-statistics';

import { BuildkiteBuild } from './types';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'foo',
    annotations: {
      'buildkite.com/pipeline': 'foo/bar',
    },
  },
};

const buildsResp: BuildkiteBuild[] = [
  {
    id: '1',
    branch: 'main',
    state: 'passed',
    created_at: '2022-03-30T13:03:09.846Z',
    started_at: '2022-03-30T13:03:09.846Z',
    finished_at: '2022-03-30T13:04:09.846Z',
    source: 'foo',
    jobs: [
      {
        name: 'job name',
        state: 'foo',
        started_at: '2015-05-09T21:07:59.874Z',
        finished_at: '2015-05-09T21:08:59.874Z',
      },
    ],
  },
];

describe('CicdStatisticsApiBuildkite', () => {
  const mockFetch = jest.fn().mockName('fetch');
  const mockDiscoveryApi: jest.Mocked<DiscoveryApi> = {
    getBaseUrl: jest
      .fn()
      .mockName('discoveryApi')
      .mockResolvedValue('http://localhost:7007'),
  };

  const mockFetchApi: MockFetchApi = new MockFetchApi({
    baseImplementation: mockFetch,
  });

  let client: CicdStatisticsApiBuildkite;

  beforeEach(() => {
    mockFetch.mockReset();

    client = new CicdStatisticsApiBuildkite({
      discoveryApi: mockDiscoveryApi,
      fetchApi: mockFetchApi,
    });
  });

  describe('createBuildkiteApi', () => {
    let bk: BuildkiteClient;

    beforeEach(async () => {
      bk = await client.createBuildkiteApi(entity);
    });

    it('returns a new Buildkite API from the passed entity', () => {
      expect(bk.api instanceof BuildkiteApi).toEqual(true);
    });

    it('returns the Buildkite org associated with the entity', () => {
      expect(bk.org).toEqual('foo');
    });

    it('returns the Buildkite pipeline associated with the entity', () => {
      expect(bk.pipeline).toEqual('bar');
    });
  });

  describe('fetchBuilds', () => {
    let builds: CicdState;
    let firstBuild: Build;

    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve(buildsResp),
      });

      const controller = new AbortController();
      builds = await client.fetchBuilds({
        entity,
        updateProgress: () => {},
        timeTo: new Date(),
        timeFrom: new Date(),
        filterStatus: ['all'],
        filterType: 'all',
        abortSignal: controller.signal,
      });

      firstBuild = builds.builds[0];
    });

    it('fetches builds via the Buildkite API and transforms the data to a CicdState', () => {
      expect(builds.builds.length).toEqual(1);
    });

    it('surfaces an id on each build', () => {
      expect(firstBuild.id).toEqual(buildsResp[0].id);
    });

    it('surfaces status on each build', () => {
      expect(firstBuild.status).toEqual('succeeded');
    });

    it('surfaces branch type on each build', () => {
      expect(firstBuild.branchType).toEqual('main');
    });

    it('surfaces a build duration on each build', () => {
      expect(firstBuild.duration).toEqual(60000);
    });

    it('surfaces the request time on each build', () => {
      expect(firstBuild.requestedAt).toEqual(
        new Date(buildsResp[0].created_at),
      );
    });

    it('surfaces details on what triggered each build', () => {
      expect(firstBuild.triggeredBy).toEqual('scm');
    });

    it('surfaces details on the build stages', () => {
      expect(firstBuild.stages.length).toEqual(1);
    });

    it('surfaces a name for each build stage', () => {
      expect(firstBuild.stages[0].name).toEqual('job name');
    });

    it('surfaces duration for each build stage', () => {
      expect(firstBuild.stages[0].duration).toEqual(60000);
    });

    it('surfaces status for each build stage', () => {
      expect(firstBuild.stages[0].status).toEqual('unknown');
    });

    it('surfaces the stages associated with each build stage', () => {
      expect(firstBuild.stages[0].stages).toEqual([
        { duration: 60000, name: 'job name', status: 'unknown' },
      ]);
    });
  });

  describe('getConfiguration', () => {
    it('surfaces the available statuses', async () => {
      const conf = await client.getConfiguration();
      expect(conf.availableStatuses).toEqual([
        'running',
        'scheduled',
        'passed',
        'failing',
        'failed',
        'blocked',
        'canceled',
        'canceling',
        'skipped',
        'not_run',
        'finished',
      ]);
    });

    it('surfaces the client defaults', async () => {
      const conf = await client.getConfiguration();
      expect(conf.defaults).toEqual({});
    });
  });
});
