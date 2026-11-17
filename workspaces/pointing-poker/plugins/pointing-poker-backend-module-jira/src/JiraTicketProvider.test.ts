/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ConfigReader } from '@backstage/config';
import { mockServices } from '@backstage/backend-test-utils';
import { InputError, NotAllowedError } from '@backstage/errors';
import fetch from 'node-fetch';
import { JiraTicketProvider } from './JiraTicketProvider';

jest.mock('node-fetch');
const fetchMock = fetch as jest.MockedFunction<typeof fetch>;

const config = (allowedProjects: string[] = ['ABC', 'DEF']) =>
  new ConfigReader({
    pointingPoker: {
      providers: {
        jira: {
          host: 'https://example.atlassian.net',
          email: 'service@example.com',
          apiToken: 'secret',
          allowedProjects,
        },
      },
    },
  });

describe('JiraTicketProvider access policy', () => {
  const logger = mockServices.logger.mock();
  let provider: JiraTicketProvider;

  beforeEach(() => {
    jest.resetAllMocks();
    provider = new JiraTicketProvider(config(), logger);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ issues: [], comments: [], fields: {} }),
    } as any);
  });

  it('requires a nonempty list of project keys', () => {
    for (const projects of [
      [],
      ['abc'],
      ['ABC" OR project = SECRET'],
      ['../ABC'],
    ]) {
      expect(() => new JiraTicketProvider(config(projects), logger)).toThrow();
    }
    expect(
      () => new JiraTicketProvider(config(undefined), logger),
    ).not.toThrow();
    const missing = new ConfigReader({
      pointingPoker: {
        providers: {
          jira: {
            host: 'https://example.atlassian.net',
            email: 'x',
            apiToken: 'x',
          },
        },
      },
    });
    expect(() => new JiraTicketProvider(missing, logger)).toThrow();
  });

  it('restricts the whole query and preserves sorting and quoted text', async () => {
    const cases = [
      [
        'status = Open OR project = SECRET',
        'project in ("ABC", "DEF") AND (status = Open OR project = SECRET)',
      ],
      [
        '(status = Open) ORDER BY created DESC, key ASC',
        'project in ("ABC", "DEF") AND ((status = Open)) ORDER BY created DESC, key ASC',
      ],
      [
        'summary ~ "(order by)"',
        'project in ("ABC", "DEF") AND (summary ~ "(order by)")',
      ],
      ['ORDER BY Rank ASC', 'project in ("ABC", "DEF") ORDER BY Rank ASC'],
    ];
    for (const [query, expected] of cases) {
      await provider.searchTickets(query);
      const init = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1];
      expect(JSON.parse(init!.body as string).jql).toBe(expected);
    }
    fetchMock.mockClear();
    for (const query of [
      'status = Open) OR project = SECRET OR (status = Open',
      '(status = Open',
      'summary ~ "unterminated',
      'status = Open ORDER BY key) OR project = SECRET',
      '',
    ]) {
      await expect(provider.searchTickets(query)).rejects.toBeInstanceOf(
        InputError,
      );
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects disallowed projects and path injection on every ticket operation', async () => {
    const operations = [
      (key: string) => provider.getTicket(key),
      (key: string) => provider.getComments(key),
      (key: string) => provider.getSubtasks(key),
      (key: string) => provider.setEstimate(key, 5),
      (key: string) => provider.postComment(key, 'hello', 'alice'),
    ];
    for (const operation of operations) {
      await expect(operation('SECRET-1')).rejects.toBeInstanceOf(
        NotAllowedError,
      );
      for (const key of [
        'ABC-1/../../user',
        'ABC-1%2Fcomment',
        'ABC-1?x=y',
        'abc-1',
        '../user',
      ]) {
        await expect(operation(key)).rejects.toBeInstanceOf(InputError);
      }
      expect(fetchMock).not.toHaveBeenCalled();
    }
    for (const operation of operations) await operation('ABC-1');
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(
      fetchMock.mock.calls.every(([url]) =>
        String(url).startsWith(
          'https://example.atlassian.net/rest/api/3/issue/ABC-1',
        ),
      ),
    ).toBe(true);
  });

  it('limits user discovery to allowed projects and removes duplicates', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ accountId: 'alice', displayName: 'Alice' }],
    } as any);
    expect(await provider.searchUsers('Alice & Bob')).toEqual([
      { id: 'alice', displayName: 'Alice' },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/user/assignable/search?project=ABC&query=Alice%20%26%20Bob',
      ),
      expect.anything(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/user/assignable/search?project=DEF&query='),
      expect.anything(),
    );
    expect(await provider.getUser('alice')).toEqual({
      id: 'alice',
      displayName: 'Alice',
    });
    expect(await provider.getUser('outside')).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('accountId=alice'),
      expect.anything(),
    );
  });

  it('logs Jira response details without exposing them to callers', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'private Jira diagnostic',
    } as any);
    await expect(provider.searchTickets('status = Open')).rejects.toThrow(
      'Jira request failed',
    );
    await expect(provider.getComments('ABC-1')).rejects.toThrow(
      /^Jira request failed$/,
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Jira request failed (403): private Jira diagnostic',
    );
  });
});
