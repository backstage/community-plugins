import { SonarQubeClient, createSonarQubeClient } from '../sonarqube.js';

// Mock fetch
jest.mock('cross-fetch', () => {
  return jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ key: 'test-project', token: 'test-token' }),
    }),
  );
});

describe('SonarQubeClient', () => {
  let client: SonarQubeClient;

  beforeEach(() => {
    client = createSonarQubeClient({
      baseUrl: 'http://localhost:9000',
      token: 'test-token',
    });
    jest.clearAllMocks();
  });

  it('creates a project', async () => {
    const result = await client.createProject({
      name: 'Test Project',
      project: 'test-project',
    });

    expect(result.key).toBe('test-project');
  });

  it('generates a token', async () => {
    const result = await client.generateToken({
      name: 'test-token',
      type: 'PROJECT_ANALYSIS_TOKEN',
      projectKey: 'test-project',
    });

    expect(result.token).toBe('test-token');
  });
});
