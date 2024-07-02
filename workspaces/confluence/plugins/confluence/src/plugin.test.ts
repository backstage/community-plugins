import { confluencePlugin } from './plugin';

describe('search-confluence', () => {
  it('should export search-confluence Plugin', () => {
    expect(confluencePlugin).toBeDefined();
  });
});
