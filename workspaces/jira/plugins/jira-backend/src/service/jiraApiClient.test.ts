import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { JiraApiClient, JiraIssue } from './jiraApiClient'; // assuming this is the correct path

describe('JiraApiClient', () => {
  const mockDiscoveryApi: DiscoveryApi = {
    getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7000'),
  } as any;

  const mockConfig: Config = {
    getOptionalString: jest.fn().mockReturnValue('mockToken'),
  } as any;

  let jiraApiClient: JiraApiClient;

  beforeEach(() => {
    jiraApiClient = new JiraApiClient({
      discoveryApi: mockDiscoveryApi,
      config: mockConfig,
    });
  });

  describe('getEncodedCredentials', () => {
    it('should encode username and token as base64', () => {
      const encoded = jiraApiClient['getEncodedCredentials']('testUser');
      const expected = Buffer.from('testUser:mockToken').toString('base64');
      expect(encoded).toBe(expected);
    });

    it('should throw an error if username or token is missing', () => {
      const invalidConfig: Config = {
        getOptionalString: jest.fn().mockReturnValue(undefined),
      } as any;
      const invalidClient = new JiraApiClient({
        discoveryApi: mockDiscoveryApi,
        config: invalidConfig,
      });

      expect(() => invalidClient['getEncodedCredentials']('')).toThrowError(
        'JIRA_API_TOKEN must be set in the configuration or environment variables',
      );
    });
  });

  describe('fetch', () => {
    it('should call fetch with the correct URL and headers', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await jiraApiClient['fetch']('/search', 'testUser');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/rest/api/latest/search',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic '),
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should throw an error if the response is not ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(jiraApiClient['fetch']('/search', 'testUser')).rejects.toThrow(
        'Failed to fetch: Not Found',
      );
    });
  });

  describe('listIssues', () => {
    it('should encode JQL and call fetch', async () => {
      const mockResponse: JiraIssue[] = [
        {
          id: '1',
          key: 'JIRA-123',
          fields: {
            summary: 'Issue summary',
            status: { name: 'Open' },
            priority: { name: 'High' },
            issuetype: { description: 'Bug' },
            reporter: { displayName: 'John Doe' },
            project: { key: 'PRJ' },
          },
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const issues = await jiraApiClient.listIssues('project = PRJ', 10, 0, 'testUser');

      expect(issues).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:7000/rest/api/latest/search?jql=project%20%3D%20PRJ&maxResults=10&startAt=0',
        expect.anything(),
      );
    });

    it('should throw an error if fetch fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(
        jiraApiClient.listIssues('project = PRJ', 10, 0, 'testUser'),
      ).rejects.toThrow('Failed to fetch: Internal Server Error');
    });
  });
});

