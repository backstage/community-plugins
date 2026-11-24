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
import { NotFoundError } from '@backstage/errors';
import type {
  MdxCardTemplate,
  MdxCardTemplateInput,
} from '@backstage-community/plugin-mdx-card-common';
import type { MdxCardApi } from '../src';

export class InMemoryMdxCardApi implements MdxCardApi {
  private readonly templates = new Map<string, MdxCardTemplate>();

  constructor(initial: MdxCardTemplate[] = []) {
    initial.forEach(template => this.templates.set(template.id, template));
  }

  async listTemplates() {
    return [...this.templates.values()].map(
      ({ template: _template, dataFetchers: _dataFetchers, ...summary }) =>
        summary,
    );
  }

  async getTemplate(id: string) {
    const template = this.templates.get(id);
    if (!template) {
      throw new NotFoundError(`No MDX card template with id "${id}"`);
    }
    return template;
  }

  async createTemplate(id: string, input: MdxCardTemplateInput) {
    const now = new Date().toISOString();
    const template = {
      ...input,
      id,
      createdBy: 'user:development/guest',
      createdAt: now,
      updatedBy: 'user:development/guest',
      updatedAt: now,
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, input: MdxCardTemplateInput) {
    const existing = await this.getTemplate(id);
    const template = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.templates.set(id, template);
    return template;
  }

  async deleteTemplate(id: string) {
    this.templates.delete(id);
  }
}
