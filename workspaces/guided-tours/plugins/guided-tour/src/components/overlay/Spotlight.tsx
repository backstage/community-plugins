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
import { Rect } from './useTargetElement';

const PADDING = 6;
const RADIUS = 8;
export const SPOTLIGHT_Z_INDEX = 99_990;

/**
 * Full-screen dimmed mask with a rounded cut-out around the target. The
 * cut-out is not painted, so pointer events fall through it when
 * `passThrough` is set; otherwise a transparent shield blocks them.
 */
export function Spotlight(props: { rect: Rect | null; passThrough?: boolean }) {
  const { rect, passThrough } = props;
  const hole = rect
    ? {
        x: rect.left - PADDING,
        y: rect.top - PADDING,
        w: rect.width + PADDING * 2,
        h: rect.height + PADDING * 2,
      }
    : undefined;

  const path = hole
    ? `M0 0H100000V100000H0Z ` +
      `M${hole.x + RADIUS} ${hole.y}` +
      `H${hole.x + hole.w - RADIUS}` +
      `A${RADIUS} ${RADIUS} 0 0 1 ${hole.x + hole.w} ${hole.y + RADIUS}` +
      `V${hole.y + hole.h - RADIUS}` +
      `A${RADIUS} ${RADIUS} 0 0 1 ${hole.x + hole.w - RADIUS} ${
        hole.y + hole.h
      }` +
      `H${hole.x + RADIUS}` +
      `A${RADIUS} ${RADIUS} 0 0 1 ${hole.x} ${hole.y + hole.h - RADIUS}` +
      `V${hole.y + RADIUS}` +
      `A${RADIUS} ${RADIUS} 0 0 1 ${hole.x + RADIUS} ${hole.y}Z`
    : 'M0 0H100000V100000H0Z';

  return (
    <svg
      data-testid="guided-tour-spotlight"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: SPOTLIGHT_Z_INDEX,
        pointerEvents: 'none',
        transition: 'opacity 150ms',
      }}
    >
      <path
        d={path}
        fillRule="evenodd"
        fill="rgba(0, 0, 0, 0.55)"
        style={{ pointerEvents: 'auto' }}
      />
      {hole && !passThrough && (
        <rect
          x={hole.x}
          y={hole.y}
          width={hole.w}
          height={hole.h}
          fill="transparent"
          style={{ pointerEvents: 'auto' }}
        />
      )}
      {hole && (
        <rect
          x={hole.x}
          y={hole.y}
          width={hole.w}
          height={hole.h}
          rx={RADIUS}
          fill="none"
          stroke="var(--bui-fg-link, #1f5eff)"
          strokeWidth={2}
        />
      )}
    </svg>
  );
}
