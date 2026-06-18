import { NexusRepositoryManagerApiClientMock } from '../../src/__fixtures__/mocks';
import dockerComponents from '../../src/__fixtures__/components/all.json';
import mavenComponents from '../../src/__fixtures__/components/maven.json';

export const nexusRepositoryManagerApiMock =
  new NexusRepositoryManagerApiClientMock([
    ...dockerComponents,
    ...mavenComponents,
  ]);
