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

import {
  buildEdgePath,
  truncateLabel,
  DAG_VIEW_CONFIG,
  DAG_INLINE_CONFIG,
  NODE_LABEL_X,
  NODE_LABEL_PADDING_RIGHT,
} from './dagHelpers';

interface Pt {
  x: number;
  y: number;
}

interface Segment {
  cp1: Pt;
  cp2: Pt;
  end: Pt;
}

/** Extracts the leading move-to and every cubic segment from a path string. */
function parsePath(d: string): { start: Pt; segments: Segment[] } {
  const numbers = (chunk: string): number[] =>
    (chunk.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

  const [moveChunk, ...cubicChunks] = d.split('C');
  const [sx, sy] = numbers(moveChunk);

  return {
    start: { x: sx, y: sy },
    segments: cubicChunks.map(chunk => {
      const [c1x, c1y, c2x, c2y, ex, ey] = numbers(chunk);
      return {
        cp1: { x: c1x, y: c1y },
        cp2: { x: c2x, y: c2y },
        end: { x: ex, y: ey },
      };
    }),
  };
}

describe('buildEdgePath', () => {
  describe('degenerate input', () => {
    it('returns an empty string for no points', () => {
      expect(buildEdgePath([])).toBe('');
    });

    it('returns a bare move for a single point', () => {
      expect(buildEdgePath([{ x: 5, y: 7 }])).toBe('M 5 7');
    });
  });

  describe('two points', () => {
    it('emits one cubic with horizontal control handles at the midpoint', () => {
      const d = buildEdgePath([
        { x: 0, y: 0 },
        { x: 100, y: 40 },
      ]);

      // Handles sit at the horizontal midpoint and keep each endpoint's own y,
      // which produces the left-to-right S-curve dagre's LR rankdir expects.
      expect(d).toBe('M 0 0 C 50 0, 50 40, 100 40');
    });
  });

  describe('three or more points', () => {
    const points: Pt[] = [
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 30, y: 10 },
      { x: 50, y: 40 },
    ];

    it('starts on the first point, ends on the last, and emits one cubic per segment', () => {
      const { start, segments } = parsePath(buildEdgePath(points));

      expect(start).toEqual(points[0]);
      expect(segments).toHaveLength(points.length - 1);
      expect(segments[segments.length - 1].end).toEqual(
        points[points.length - 1],
      );
    });

    it('passes exactly through every waypoint', () => {
      const { segments } = parsePath(buildEdgePath(points));

      // Each segment terminates on the next waypoint, so the spline is
      // interpolating rather than approximating.
      expect(segments.map(s => s.end)).toEqual(points.slice(1));
    });

    it('shares a tangent across each interior waypoint', () => {
      const { segments } = parsePath(buildEdgePath(points));

      // C1 continuity: the outgoing handle of one segment and the incoming
      // handle of the next must be reflections of each other about the shared
      // waypoint. This is the guard against per-segment curves that meet at
      // mismatched tangents and render as visible kinks.
      for (let i = 1; i < segments.length; i++) {
        const waypoint = segments[i - 1].end;
        const incoming = segments[i - 1].cp2;
        const outgoing = segments[i].cp1;

        expect(incoming.x + outgoing.x).toBeCloseTo(2 * waypoint.x, 6);
        expect(incoming.y + outgoing.y).toBeCloseTo(2 * waypoint.y, 6);
      }
    });

    it('keeps control points on the line for collinear waypoints', () => {
      const collinear: Pt[] = [
        { x: 0, y: 50 },
        { x: 25, y: 50 },
        { x: 75, y: 50 },
        { x: 100, y: 50 },
      ];

      const { segments } = parsePath(buildEdgePath(collinear));

      // A straight run of waypoints must not bow: every handle stays on y=50.
      for (const segment of segments) {
        expect(segment.cp1.y).toBeCloseTo(50, 6);
        expect(segment.cp2.y).toBeCloseTo(50, 6);
      }
    });

    it('produces distinct control points within a segment', () => {
      const { segments } = parsePath(buildEdgePath(points));

      // Regression guard: an earlier implementation computed both handles from
      // the same expression, collapsing them onto one another.
      for (const segment of segments) {
        expect(segment.cp1).not.toEqual(segment.cp2);
      }
    });
  });
});

describe('DAG layout configs', () => {
  it.each([
    ['DAG_VIEW_CONFIG', DAG_VIEW_CONFIG],
    ['DAG_INLINE_CONFIG', DAG_INLINE_CONFIG],
  ])(
    '%s budgets labelMaxChars within the available node width',
    (_, config) => {
      const available =
        config.nodeWidth - NODE_LABEL_X - NODE_LABEL_PADDING_RIGHT;

      // Labels render left-aligned after the accent bar and status icon, so the
      // truncation budget has to fit the remaining width even for wide glyphs.
      const worstCaseWidth = config.labelMaxChars * config.fontSize * 0.6;

      expect(worstCaseWidth).toBeLessThanOrEqual(available);
    },
  );

  it('truncates labels at the configured budget', () => {
    const long = 'a'.repeat(DAG_INLINE_CONFIG.labelMaxChars + 10);
    const truncated = truncateLabel(long, DAG_INLINE_CONFIG.labelMaxChars);

    expect(truncated).toHaveLength(DAG_INLINE_CONFIG.labelMaxChars - 1);
    expect(truncated.endsWith('…')).toBe(true);
  });
});
