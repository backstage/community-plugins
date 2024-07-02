import {
  AdrCollatorFactoryOptions as moduleAdrCollatorFactoryOptions,
  DefaultAdrCollatorFactory as moduleDefaultAdrCollatorFactory,
} from '@backstage-community/search-backend-module-adr';
import {
  AdrParser as commonAdrParser,
  AdrParserContext as commonAdrParserContext,
  createMadrParser as commonCreateMadrParser,
  MadrParserOptions as commonMadrParserOptions,
} from '@backstage-community/plugin-adr-common';

/**
 * Options to configure the AdrCollatorFactory
 * @public
 * @deprecated Import from `@backstage-community/search-backend-module-adr` instead
 */
export type AdrCollatorFactoryOptions = moduleAdrCollatorFactoryOptions;

/**
 * ADR parser function type.
 * @public
 * @deprecated Import from `@backstage-community/plugin-adr-common` instead
 */
export type AdrParser = commonAdrParser;

/**
 * Context passed to a AdrParser.
 * @public
 * @deprecated Import from `@backstage-community/plugin-adr-common` instead
 */
export type AdrParserContext = commonAdrParserContext;

/**
 *
 * Options for the default MADR content parser
 * @public
 * @deprecated Import from `@backstage-community/plugin-adr-common` instead
 */
export type MadrParserOptions = commonMadrParserOptions;

/**
 * Default content parser for ADRs following the MADR template (https://adr.github.io/madr/)
 * @public
 * @deprecated Import from `@backstage-community/plugin-adr-common` instead
 */
export const createMadrParser = commonCreateMadrParser;

/**
 * Default collator to index ADR documents for Backstage search.
 * @public
 * @deprecated Import from `@backstage-community/search-backend-module-adr` instead
 */
export { moduleDefaultAdrCollatorFactory as DefaultAdrCollatorFactory };
