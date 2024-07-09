import { devfileSelectorExtensionPlugin } from './plugin';

describe('plugin-scaffolder-frontend-module-devfile-field', () => {
  it('should export DevfileSelector plugin', () => {
    expect(devfileSelectorExtensionPlugin).toBeDefined();
  });
});
