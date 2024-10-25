import { Config } from '@backstage/config';
import { Knex } from 'knex';
import { JiraService } from './jiraService';
import { JiraApiClient } from './jiraApiClient';

jest.mock('./jiraApiClient');

describe('JiraService', () => {
  let jiraService: JiraService;
  let db: Knex;
  let config: Config;
  let mockJiraApi: JiraApiClient;

  beforeEach(() => {
    db = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      first: jest.fn(),
      onConflict: jest.fn().mockReturnThis(),
      merge: jest.fn(),
    } as unknown as Knex;

    config = {
      getOptionalString: jest.fn().mockReturnValue('https://jira.example.com'),
    } as unknown as Config;

    mockJiraApi = {
      listIssues: jest.fn(),
    } as unknown as JiraApiClient;

    jiraService = new JiraService(db, config);
    (JiraApiClient as jest.Mock).mockImplementation(() => mockJiraApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('getStoredIssues', () => {
  
    it('should handle errors when retrieving stored issues', async () => {
      db.select.mockRejectedValue(new Error('Database error'));

      await expect(jiraService.getStoredIssues()).rejects.toThrow(
        'Failed to retrieve stored Jira issues',
      );
    });
  });

  describe('getCurrentUserEmail', () => {

    it('should return null if no user is found', async () => {
      db.first.mockResolvedValue(null);

      const result = await jiraService.getCurrentUserEmail();

      expect(result).toBeNull();
    });

    it('should handle errors when fetching user email', async () => {
      db.first.mockRejectedValue(new Error('Database error'));

      const result = await jiraService.getCurrentUserEmail();

      expect(result).toBeNull();
    });
  });
});
