import { nexusRepositoryManagerPlugin } from './plugin';

describe('nexus repository manager', () => {
  it('should export plugin', () => {
    expect(nexusRepositoryManagerPlugin).toBeDefined();
  });
});
