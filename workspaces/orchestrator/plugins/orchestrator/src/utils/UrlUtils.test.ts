import { QUERY_PARAM_BUSINESS_KEY } from '@janus-idp/backstage-plugin-orchestrator-common';

import { buildUrl } from './UrlUtils';

describe('UrlUtils', () => {
  const baseUrl = 'https://my.base.url.com';
  it('should return the base URL', async () => {
    const res = buildUrl(baseUrl);
    expect(res).toBeDefined();
    expect(res).toEqual(baseUrl);
  });
  it('should return the base URL with the query params', async () => {
    const queryParams: Record<string, any> = {
      param1: 1,
      param2: 'two',
      param3: true,
    };
    const res = buildUrl(baseUrl, queryParams);
    expect(res).toBeDefined();
    expect(res).not.toEqual(`${baseUrl}`);
    expect(res).toEqual(`${baseUrl}?param1=1&param2=two&param3=true`);
  });
  it('should return the base URL with business key param', async () => {
    const queryParams: Record<string, any> = {
      [QUERY_PARAM_BUSINESS_KEY]: 'businessKey1',
    };
    const res = buildUrl(baseUrl, queryParams);
    expect(res).toBeDefined();
    expect(res).not.toEqual(`${baseUrl}`);
    expect(res).toEqual(`${baseUrl}?${QUERY_PARAM_BUSINESS_KEY}=businessKey1`);
  });
});
