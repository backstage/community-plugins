import { NEXUS_REPOSITORY_MANAGER_ANNOTATIONS } from '../../annotations';
import { NexusRepositoryManagerApiV1 } from '../../api';
import { SearchServiceQuery } from '../../types';

export class NexusRepositoryManagerApiClientMock
  implements NexusRepositoryManagerApiV1
{
  readonly components;

  constructor(components: any) {
    this.components = components;
  }

  async getComponents(_: SearchServiceQuery) {
    return { components: this.components };
  }

  getAnnotations() {
    return { ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS };
  }
}
