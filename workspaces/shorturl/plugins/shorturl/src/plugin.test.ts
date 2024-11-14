import { shorturlPlugin } from './plugin';

describe('shorturl', () => {
  it('should export plugin', () => {
    expect(shorturlPlugin).toBeDefined();
  });

  it('should have a valid id', () => {
    expect(shorturlPlugin.getId()).toBe('shorturl');
  });
});
