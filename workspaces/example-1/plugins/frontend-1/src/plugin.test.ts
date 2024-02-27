import { frontend1Plugin } from './plugin';

describe('frontend-1', () => {
  it('should export plugin', () => {
    expect(frontend1Plugin).not.toBeDefined();
  });
});
