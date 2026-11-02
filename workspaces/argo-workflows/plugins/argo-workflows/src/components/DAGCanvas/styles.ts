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
 * Class names `DAGCanvas` reads from the owning view's CSS module.
 *
 * The canvas is shared by the full-page and inline views, which each supply
 * their own module so they can size the container differently. Naming the
 * contract here turns a misspelled class into a compile error instead of a
 * silently unstyled element.
 */
export type DAGCanvasClassName =
  /** Outermost wrapper; owns the overall height of the canvas. */
  | 'container'
  /** Positioning context for the SVG, minimap and tooltip. */
  | 'canvasArea'
  | 'svg'
  /** Applied alongside `svg` while a drag is in progress. */
  | 'panning'
  | 'node'
  | 'minimap'
  | 'tooltip'
  | 'tooltipTitle'
  | 'tooltipLabel'
  | 'tooltipStatus'
  /** Only required when the canvas renders its own zoom controls. */
  | 'controls';

/**
 * A CSS module supplying the classes above.
 *
 * Every entry is optional because CSS modules are typed as an open string
 * index, and because `controls` is unused when a view renders the zoom buttons
 * itself.
 */
export type DAGCanvasStyles = Partial<Record<DAGCanvasClassName, string>>;
