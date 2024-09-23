import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
} from '@backstage/core-plugin-api';
import {
  TechRadarApi,
  TechRadarLoaderResponse,
  techRadarApiRef,
} from '@backstage-community/plugin-tech-radar';

// overriding the api is one way to change the radar content
const mock: TechRadarLoaderResponse = {
  entries: [],
  quadrants: [
    { id: 'infrastructure', name: 'Infrastructure' },
    { id: 'frameworks', name: 'Frameworks' },
    { id: 'languages', name: 'Languages' },
    { id: 'process', name: 'Process' },
  ],
  rings: [],
};
class SampleTechRadarApi implements TechRadarApi {
  async load() {
    return mock;
  }
}

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory(techRadarApiRef, new SampleTechRadarApi()),
];
