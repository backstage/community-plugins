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
import { TranslationRef } from '@backstage/frontend-plugin-api';
import { JSX } from 'react';

/**
 * Any translation ref, used as the default type parameter of tours.
 *
 * @public
 */
export type AnyTranslationRef = TranslationRef<
  string,
  { [key in string]: string }
>;

/**
 * The message keys of a translation ref, e.g. `'steps.intro.title'`. Plural
 * forms (`key_one`, `key_other`) collapse to their base key, like the `t`
 * function of `useTranslationRef` does.
 *
 * @public
 */
export type TranslationKeyOf<TRef extends AnyTranslationRef> = {
  [K in keyof TRef['T']]: K extends `${infer Base}_${
    | 'zero'
    | 'one'
    | 'two'
    | 'few'
    | 'many'
    | 'other'}`
    ? Base
    : K;
}[keyof TRef['T']] &
  string;

declare const translatedTextBrand: unique symbol;

/**
 * A text taken from a translation ref, created with {@link translated}.
 * The type is opaque: a plain `{ translationRef, key }` object is not
 * accepted, because only the `translated` call can check that the key is
 * part of the ref's messages.
 *
 * @public
 */
export interface GuidedTourTranslatedText {
  /** Discriminator, see {@link isGuidedTourTranslatedText}. */
  readonly $$type: '@backstage-community/plugin-guided-tours-react/TranslatedText';
  /** The translation ref the message is taken from. */
  readonly translationRef: AnyTranslationRef;
  /** The message key inside the translation ref. */
  readonly key: string;
  /** Type-only brand; nothing outside `translated` can supply it. */
  readonly [translatedTextBrand]: true;
}

/**
 * Marks a text as translated. The key is checked against the messages of
 * the translation ref at compile time.
 *
 * @example
 * ```ts
 * title: translated(exampleTranslationRef, 'tour.done.title')
 * ```
 *
 * @public
 */
export function translated<TRef extends AnyTranslationRef>(
  translationRef: TRef,
  key: TranslationKeyOf<TRef>,
): GuidedTourTranslatedText {
  return {
    $$type: '@backstage-community/plugin-guided-tours-react/TranslatedText',
    translationRef,
    key,
  } as unknown as GuidedTourTranslatedText;
}

/**
 * Whether a value is a text created with {@link translated}.
 *
 * @public
 */
export function isGuidedTourTranslatedText(
  value: unknown,
): value is GuidedTourTranslatedText {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as GuidedTourTranslatedText).$$type ===
      '@backstage-community/plugin-guided-tours-react/TranslatedText'
  );
}

/**
 * A plain string or a text created with {@link translated}.
 *
 * @public
 */
export type GuidedTourText = string | GuidedTourTranslatedText;

/**
 * Step content rendered by a React element that is loaded on demand, like
 * the `loader` of `PageBlueprint`. The chunk is fetched when the step is
 * shown, so a tour may embed rich content without growing the plugin's
 * main bundle.
 *
 * @example
 * ```ts
 * content: {
 *   loader: () => import('./TourHint').then(m => <m.TourHint />),
 * }
 * ```
 *
 * @public
 */
export interface GuidedTourElementLoader {
  /** Loads the element, typically through a dynamic `import()`. */
  loader: () => Promise<JSX.Element>;
}

/**
 * Whether a step content is an element loader.
 *
 * @public
 */
export function isGuidedTourElementLoader(
  content: unknown,
): content is GuidedTourElementLoader {
  return (
    typeof content === 'object' &&
    content !== null &&
    typeof (content as GuidedTourElementLoader).loader === 'function'
  );
}

/**
 * Placement of the step card relative to the highlighted element.
 * A subset of react-aria placements.
 *
 * @public
 */
export type GuidedTourPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'start'
  | 'end';

/**
 * A single step of a guided tour.
 *
 * @public
 */
export interface GuidedTourStep {
  /** Unique id of the step inside its tour. */
  id: string;
  /** Optional title shown above the content; a string or a translated text. */
  title?: GuidedTourText;
  /**
   * Content shown in the step card: a string or a translated text with
   * minimal markdown (paragraphs, bold, italic, inline code, links, bullet
   * and numbered lists), or a lazily loaded React element.
   */
  content: GuidedTourText | GuidedTourElementLoader;
  /**
   * Element to spotlight. A bare id is resolved to
   * `[data-guided-tour="<id>"]`; use `{ selector }` for an arbitrary CSS
   * selector. Omit to show the step centered without a spotlight.
   */
  target?: string | { selector: string };
  /** Where to place the card relative to the target. Default `bottom`. */
  placement?: GuidedTourPlacement;
  /** App-relative path to navigate to before the step is shown. */
  route?: string;
  /**
   * `next` (default): the Next button advances the tour.
   * `click`: clicking the highlighted element advances the tour and the
   * click is passed through to the element.
   */
  advanceOn?: 'next' | 'click';
  /** How long to wait for the target to appear. Default 5000 ms. */
  targetTimeoutMs?: number;
  /**
   * What to do when the target never appears: show the step centered
   * (`center`, default) or skip it (`skip`).
   */
  onMissingTarget?: 'center' | 'skip';
}

/**
 * When a tour starts on its own.
 *
 * - `false`: manual only (default).
 * - `'login'`: part of the onboarding sequence; a login tour that shows up
 *   after the user has been onboarded is played alone.
 * - `{ path }`: the first time the current location is the path. With
 *   `exact: false` any location below the path matches as well.
 *
 * @public
 */
export type GuidedTourAutoStart =
  | false
  | 'login'
  | {
      /** App-relative path, e.g. `/catalog`. */
      path: string;
      /**
       * Match the path exactly (default `true`), or also any location
       * below it such as `/catalog/default/component/foo` (`false`).
       */
      exact?: boolean;
    };

/**
 * A guided tour: an ordered list of steps plus metadata.
 *
 * @public
 */
export interface GuidedTour {
  /** Unique id, e.g. `example/intro`. */
  id: string;
  /** Shown above every step and on the overview page; a string or a translated text. */
  title: GuidedTourText;
  /** One or two sentences for the overview page; a string or a translated text. */
  description?: GuidedTourText;
  /**
   * Bump to show the tour again to users who completed or dismissed an
   * older version. Default 1.
   */
  version?: number;
  /** Ordering in the onboarding queue and on the overview page. Default 100. */
  order?: number;
  /** When the tour starts on its own. Default `false`. */
  autoStart?: GuidedTourAutoStart;
  /**
   * App-relative path to navigate to when the tour is finished with Done
   * (or by clicking through its last step), e.g. back to the start page.
   */
  completeRoute?: string;
  /** The steps in the order they are shown. */
  steps: GuidedTourStep[];
}

/**
 * Params accepted by {@link GuidedTourBlueprint}. The id defaults to the
 * extension id without the `guided-tour:` prefix.
 *
 * @public
 */
export type GuidedTourParams = Omit<GuidedTour, 'id'> & { id?: string };

/**
 * Resolves a step target into a CSS selector.
 *
 * @public
 */
export function guidedTourTargetSelector(
  target: NonNullable<GuidedTourStep['target']>,
): string {
  if (typeof target === 'string') {
    return `[data-guided-tour="${target.replace(/"/g, '\\"')}"]`;
  }
  return target.selector;
}
