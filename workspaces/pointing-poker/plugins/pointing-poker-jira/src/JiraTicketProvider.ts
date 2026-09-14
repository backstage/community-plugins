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
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';
import type {
  Ticket,
  TicketDetail,
  TicketComment,
  ProviderUser,
  Subtask,
  CommentSegment,
} from '@backstage-community/plugin-pointing-poker-common';

export class JiraTicketProvider {
  readonly providerId = 'jira';

  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(config: Config, private readonly logger: LoggerService) {
    const jiraCfg = config.getConfig('pointingPoker.jira');
    const host = jiraCfg.getString('host').replace(/\/$/, '');
    const email = jiraCfg.getString('email');
    const token = jiraCfg.getString('apiToken');
    this.baseUrl = `${host}/rest/api/3`;
    this.authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString(
      'base64',
    )}`;
  }

  private async jiraFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...init?.headers,
      },
    } as any);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Jira ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async searchTickets(jql: string): Promise<Ticket[]> {
    const data = await this.jiraFetch<{ issues: any[] }>('/search/jql', {
      method: 'POST',
      body: JSON.stringify({
        jql,
        maxResults: 100,
        fields: [
          'summary',
          'status',
          'assignee',
          'priority',
          'created',
          'reporter',
          'issuetype',
        ],
      }),
    });
    return (data.issues ?? []).map(issue => ({
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status?.name,
      assignee: issue.fields.assignee?.displayName,
      priority: issue.fields.priority?.name,
      url: `${this.baseUrl.replace('/rest/api/3', '')}/browse/${issue.key}`,
      author: issue.fields.reporter?.displayName,
      authorAvatarUrl: issue.fields.reporter?.avatarUrls?.['48x48'],
      created: issue.fields.created,
      type: issue.fields.issuetype?.name,
      typeIconUrl: issue.fields.issuetype?.iconUrl,
      sprint: null,
    }));
  }

  async getTicket(key: string): Promise<TicketDetail | null> {
    try {
      const issue = await this.jiraFetch<any>(
        `/issue/${key}?fields=summary,description,status,assignee,priority,reporter,created,issuetype,attachment`,
      );
      const desc = this.adfToMarkdown(issue.fields.description);
      return {
        key: issue.key,
        summary: issue.fields.summary,
        description: desc,
        status: issue.fields.status?.name,
        assignee: issue.fields.assignee?.displayName,
        priority: issue.fields.priority?.name,
        reporterName: issue.fields.reporter?.displayName,
        url: `${this.baseUrl.replace('/rest/api/3', '')}/browse/${key}`,
        author: issue.fields.reporter?.displayName,
        createdAt: issue.fields.created,
        type: issue.fields.issuetype?.name,
        typeIconUrl: issue.fields.issuetype?.iconUrl,
        attachments: (issue.fields.attachment ?? []).map((a: any) => ({
          id: a.id,
          filename: a.filename,
          mimeType: a.mimeType,
          size: a.size,
          url: a.content,
        })),
      };
    } catch (err) {
      this.logger.warn(`Failed to fetch Jira ticket ${key}`, err as Error);
      return null;
    }
  }

  async setEstimate(key: string, points: number): Promise<void> {
    await this.jiraFetch(`/issue/${key}`, {
      method: 'PUT',
      body: JSON.stringify({
        fields: { story_points: points, 'Story Points': points },
      }),
    } as any);
  }

  async getComments(key: string): Promise<TicketComment[]> {
    const data = await this.jiraFetch<{ comments: any[] }>(
      `/issue/${key}/comment?orderBy=created&maxResults=50`,
    );
    return data.comments.map(c => ({
      id: c.id,
      author: c.author?.displayName ?? 'Unknown',
      authorAvatarUrl: c.author?.avatarUrls?.['48x48'],
      body: this.adfToMarkdown(c.body) ?? '',
      createdAt: c.created,
    }));
  }

  async postComment(
    key: string,
    content: CommentSegment[] | string,
    _author: string,
  ): Promise<void> {
    const paragraphContent =
      typeof content === 'string'
        ? [{ type: 'text', text: content }]
        : content.map(segment =>
            segment.type === 'mention'
              ? {
                  type: 'mention',
                  attrs: { id: segment.id, text: segment.text },
                }
              : { type: 'text', text: segment.text },
          );
    await this.jiraFetch(`/issue/${key}/comment`, {
      method: 'POST',
      body: JSON.stringify({
        body: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: paragraphContent,
            },
          ],
        },
      }),
    } as any);
  }

  async searchUsers(query: string): Promise<ProviderUser[]> {
    const data = await this.jiraFetch<any[]>(
      `/user/search?query=${encodeURIComponent(query)}&maxResults=10`,
    );
    return data.map(u => ({
      id: u.accountId,
      displayName: u.displayName,
      email: u.emailAddress,
      avatarUrl: u.avatarUrls?.['48x48'],
    }));
  }

  async getUser(id: string): Promise<ProviderUser | null> {
    try {
      const u = await this.jiraFetch<any>(
        `/user?accountId=${encodeURIComponent(id)}`,
      );
      return {
        id: u.accountId,
        displayName: u.displayName,
        email: u.emailAddress,
        avatarUrl: u.avatarUrls?.['48x48'],
      };
    } catch (err) {
      this.logger.warn(`Failed to fetch Jira user ${id}`, err as Error);
      return null;
    }
  }

  async getSubtasks(key: string): Promise<Subtask[]> {
    try {
      const issue = await this.jiraFetch<any>(`/issue/${key}?fields=subtasks`);
      return (issue.fields.subtasks ?? []).map((s: any) => ({
        key: s.key,
        summary: s.fields.summary,
        type: s.fields.issuetype?.name,
        priority: s.fields.priority?.name,
      }));
    } catch (err) {
      this.logger.warn(
        `Failed to fetch Jira subtasks for ${key}`,
        err as Error,
      );
      return [];
    }
  }

  private adfToMarkdown(adf: any): string | undefined {
    if (!adf) return undefined;
    if (typeof adf === 'string') return adf;
    return this.renderAdfNode(adf);
  }

  private renderAdfNode(node: any): string {
    if (!node) return '';
    if (node.type === 'text') {
      return (node.marks ?? []).reduce((text: string, mark: any) => {
        switch (mark.type) {
          case 'strong':
            return `**${text}**`;
          case 'em':
            return `_${text}_`;
          case 'code':
            return `\`${text}\``;
          case 'strike':
            return `~~${text}~~`;
          case 'link':
            return `[${text}](${mark.attrs?.href ?? ''})`;
          default:
            return text;
        }
      }, node.text ?? '');
    }
    if (node.type === 'bulletList' || node.type === 'orderedList') {
      const ordered = node.type === 'orderedList';
      const start = node.attrs?.order ?? 1;
      return (node.content ?? [])
        .map((item: any, index: number) => {
          const itemContent = (item.content ?? [])
            .map((child: any) => this.renderAdfNode(child))
            .join('')
            .trim();
          return `${ordered ? `${start + index}.` : '-'} ${itemContent}\n`;
        })
        .join('');
    }
    const content = (node.content ?? [])
      .map((n: any) => this.renderAdfNode(n))
      .join('');
    switch (node.type) {
      case 'paragraph':
        return `${content}\n\n`;
      case 'heading':
        return `${'#'.repeat(node.attrs?.level ?? 1)} ${content}\n\n`;
      case 'listItem':
        return `- ${content.trim()}\n`;
      case 'codeBlock':
        return `\`\`\`\n${content}\n\`\`\`\n\n`;
      case 'code':
        return `\`${content}\``;
      case 'strong':
        return `**${content}**`;
      case 'em':
        return `_${content}_`;
      case 'strike':
        return `~~${content}~~`;
      case 'hardBreak':
        return '\n';
      case 'rule':
        return '---\n\n';
      case 'blockquote':
        return `${content
          .split('\n')
          .map((l: string) => `> ${l}`)
          .join('\n')}\n\n`;
      case 'panel':
        return `${content
          .trim()
          .split('\n')
          .map((line: string) => `> ${line}`)
          .join('\n')}\n\n`;
      case 'link':
        return `[${content}](${node.attrs?.href ?? ''})`;
      case 'inlineCard':
        return node.attrs?.url ?? '';
      default:
        return content;
    }
  }
}
