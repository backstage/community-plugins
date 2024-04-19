/*
 * Copyright 2022 The Backstage Authors
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
import { parseMadrWithFrontmatter } from '@backstage-community/plugin-adr-common';
import { AdrContentDecorator } from './types';

/**
 *
 * Factory for creating default ADR content decorators. The adrDecoratorFactories
 * symbol is not directly exported, but through the AdrReader.decorators field.
 * @public
 */
export const adrDecoratorFactories = Object.freeze({
  /**
   * Rewrites relative Markdown links as absolute links.
   */
  createRewriteRelativeLinksDecorator(): AdrContentDecorator {
    return ({ baseUrl, content }) => ({
      content: content.replace(
        /\[([^\[\]]*)\]\((?!https?:\/\/)(.*?)(\.md)\)/gim,
        `[$1](${baseUrl}/$2$3)`,
      ),
    });
  },
  /**
   * Rewrites relative Markdown embeds using absolute URLs.
   */
  createRewriteRelativeEmbedsDecorator(): AdrContentDecorator {
    return ({ baseUrl, content }) => ({
      content: content.replace(
        /!\[([^\[\]]*)\]\((?!https?:\/\/)(.*?)(\.png|\.jpg|\.jpeg|\.gif|\.webp)(.*)\)/gim,
        `![$1](${baseUrl}/$2$3$4)`,
      ),
    });
  },
  /**
   * Formats YAML front-matter into a table format (if any exists in the markdown document)
   */
  createFrontMatterFormatterDecorator(): AdrContentDecorator {
    return ({ content }) => {
      const parsedFrontmatter = parseMadrWithFrontmatter(content);
      let table = '';
      const attrs = parsedFrontmatter.attributes;
      if (Object.keys(attrs).length > 0) {
        const stripNewLines = (val: unknown) =>
          String(val).replaceAll('\n', '<br/>');
        const row = (vals: string[]) => `|${vals.join('|')}|\n`;
        table = `${row(Object.keys(attrs))}`;
        table += `${row(Object.keys(attrs).map(() => '---'))}`;
        table += `${row(Object.values(attrs).map(stripNewLines))}\n\n`;
      }
      return { content: table + parsedFrontmatter.content };
    };
  },
});
