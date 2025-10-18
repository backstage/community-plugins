import { NexusRepositoryManagerApiClientMock } from '../../src/__fixtures__/mocks';
import components from '../../src/__fixtures__/components/all.json';

export const nexusRepositoryManagerApiMock =
  new NexusRepositoryManagerApiClientMock(components);
