import { azureStoragePlugin } from './plugin';

describe('azure-storage', () => {
  it('should export plugin', () => {
    expect(azureStoragePlugin).toBeDefined();
  });
});
