import { confluenceFrontendPlugin } from './plugin';

describe('search-confluence', () => {
  it('should export search-confluence Plugin', () => {
    expect(confluenceFrontendPlugin).toBeDefined();
  });
});
