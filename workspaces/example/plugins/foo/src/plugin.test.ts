import { fooPlugin } from './plugin';

describe('foo', () => {
  it('should export plugin', () => {
    expect(fooPlugin).toBeDefined();
  });
});
