import { linkerdPlugin } from './plugin';

describe('linkerd', () => {
  it('should export plugin', () => {
    expect(linkerdPlugin).toBeDefined();
  });
});
