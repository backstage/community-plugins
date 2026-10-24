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
  /** Optional title shown above the content. */
  title?: string;
  /**
   * Content shown in the step card. Supports minimal markdown: paragraphs,
   * bold, italic, inline code, links, bullet and numbered lists.
   */
  content: string;
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
 * - `{ path }`: the first time the current location matches the path.
 *
 * @public
 */
export type GuidedTourAutoStart = false | 'login' | { path: string };

/**
 * A guided tour: an ordered list of steps plus metadata.
 *
 * @public
 */
export interface GuidedTour {
  /** Unique id, e.g. `example/intro`. */
  id: string;
  /** Shown above every step and on the overview page. */
  title: string;
  /** One or two sentences for the overview page. */
  description?: string;
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
