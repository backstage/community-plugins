/*
 * Copyright 2024 The Backstage Authors
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
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { DateTime } from 'luxon';
import { marked, Tokens, TokensList } from 'marked';
import { IndexableDocument } from '@backstage/plugin-search-common';
import frontMatter from 'front-matter';

/**
 * Standard luxon DateTime format string for MADR dates.
 * @public
 */
export const MADR_DATE_FORMAT = 'yyyy-MM-dd';

const getTitle = (tokens: TokensList): string | undefined => {
  return (
    tokens.find(t => t.type === 'heading' && t.depth === 1) as Tokens.Heading
  )?.text;
};

const getStatusForV2Format = (tokens: TokensList): string | undefined =>
  (tokens.find(t => t.type === 'list') as Tokens.List)?.items
    ?.find(t => /^status:/i.test(t.text))
    ?.text.replace(/^status:/i, '')
    .trim()
    .toLocaleLowerCase('en-US');

const getDateForV2Format = (tokens: TokensList): string | undefined => {
  const listTokens = (tokens.find(t => t.type === 'list') as Tokens.List)
    ?.items;
  const adrDateTime = listTokens
    ?.find(t => /^date:/i.test(t.text))
    ?.text.replace(/^date:/i, '')
    .trim();
  return adrDateTime;
};

const getStatus = (
  tokens: TokensList,
  frontMatterStatus?: string,
): string | undefined => {
  return frontMatterStatus ?? getStatusForV2Format(tokens);
};
const getDate = (
  tokens: TokensList,
  dateFormat: string,
  frontMatterDate?: string,
): string | undefined => {
  const dateString = frontMatterDate ?? getDateForV2Format(tokens);
  if (!dateString) {
    return undefined;
  }
  const date = DateTime.fromFormat(dateString, dateFormat);
  return date?.isValid ? date.toFormat(MADR_DATE_FORMAT) : undefined;
};

/**
 * ADR indexable document interface
 * @public
 */
export interface AdrDocument extends IndexableDocument {
  /**
   * Ref of the entity associated with this ADR
   */
  entityRef: string;
  /**
   * Title of the entity associated with this ADR
   */
  entityTitle?: string;
  /**
   * ADR status label
   */
  status?: string;
  /**
   * ADR date
   */
  date?: string;
}

/**
 * Parsed MADR document with front matter (if present) parsed and extracted from the main markdown content.
 * @public
 */
export interface ParsedMadr {
  /**
   * Main body of ADR content (with any front matter removed)
   */
  content: string;
  /**
   * ADR status
   */
  status?: string;
  /**
   * ADR date
   */
  date?: string;
  /**
   * All attributes parsed from front matter
   */
  attributes: Record<string, unknown>;
}

/**
 * Utility function to parse raw markdown content for an ADR and extract any metadata found as "front matter" at the top of the Markdown document.
 * @param content - Raw markdown content which may (optionally) include front matter
 * @public
 */
export const parseMadrWithFrontmatter = (content: string): ParsedMadr => {
  const parsed = frontMatter<Record<string, unknown>>(content);
  const status = parsed.attributes.status;
  const date = parsed.attributes.date;
  const luxdate = DateTime.fromJSDate(new Date(`${date}`));
  const formattedDate = luxdate.toISODate();
  return {
    content: parsed.body,
    status: status ? String(status) : undefined,
    date: date ? String(formattedDate) : undefined,
    attributes: parsed.attributes,
  };
};

/**
 * The default MADR parser.
 * @public
 */
export const madrParser = (
  content: string,
  dateFormat = MADR_DATE_FORMAT,
): AdrInfo => {
  const preparsed = parseMadrWithFrontmatter(content);
  const tokens = marked.lexer(preparsed.content);
  if (!tokens.length) {
    throw new Error('ADR has no content');
  }

  return {
    title: getTitle(tokens),
    status: getStatus(tokens, preparsed.status),
    date: getDate(tokens, dateFormat, preparsed.date),
  };
};

/**
 * Context passed to a AdrParser.
 * @public
 */
export type AdrParserContext = {
  /**
   * The entity associated with the ADR.
   */
  entity: Entity;
  /**
   * The ADR content string.
   */
  content: string;
  /**
   * The ADR file path.
   */
  path: string;
};

/**
 * ADR parser function type.
 * @public
 */
export type AdrParser = (ctx: AdrParserContext) => Promise<AdrDocument>;

const applyArgsToFormat = (
  format: string,
  args: Record<string, string>,
): string => {
  let formatted = format;
  for (const [key, value] of Object.entries(args)) {
    formatted = formatted.replace(`:${key}`, value);
  }
  return formatted.toLocaleLowerCase('en-US');
};

/**
 * The default location URL template
 * @public
 */
export const DEFAULT_LOCATION_TEMPLATE =
  '/catalog/:namespace/:kind/:name/adrs?record=:record';

/**
 *
 * Options for the default MADR content parser
 * @public
 */
export type MadrParserOptions = {
  /**
   * Location template for the route of the frontend plugin
   * Defaults to '/catalog/:namespace/:kind/:name/adrs?record=:record'
   */
  locationTemplate?: string;
  /**
   * luxon DateTime format string to parse ADR dates with.
   * Defaults to 'yyyy-MM-dd'
   */
  dateFormat?: string;
};

/**
 * Default content parser for ADRs following the MADR template (https://adr.github.io/madr/)
 * @public
 */
export const createMadrParser = (
  options: MadrParserOptions = {},
): AdrParser => {
  const locationTemplate =
    options.locationTemplate ?? DEFAULT_LOCATION_TEMPLATE;
  const dateFormat = options.dateFormat ?? MADR_DATE_FORMAT;

  return async ({ entity, content, path }) => {
    const madr: AdrInfo = madrParser(content, dateFormat);
    return {
      title: madr.title ?? path.replace(/\.md$/, ''),
      text: content,
      status: madr.status,
      date: madr.date,
      entityRef: stringifyEntityRef(entity),
      entityTitle: entity.metadata.title,
      location: applyArgsToFormat(locationTemplate, {
        namespace: entity.metadata.namespace || 'default',
        kind: entity.kind,
        name: entity.metadata.name,
        record: path,
      }),
    };
  };
};

/**
 * ADR info interface
 * @public
 */
export interface AdrInfo {
  title?: string;
  status?: string;
  date?: string;
}

/**
 * ADR info parser function type.
 * @public
 */
export type AdrInfoParser = (content: string, dateFormat?: string) => AdrInfo;
