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
import { forwardRef, HTMLAttributes, useContext } from 'react';

import type { Blip } from '../../types';
import { BLIP_RADIUS } from '../RadarPlot/radarPlotUtils';
import { RadarFilterContext } from '../RadarFilterContext';
import { cn } from '../../util/cn';
import color from 'color';

type RadarBlipProps = Readonly<{
  blip: Blip;
  muted?: boolean;
  selected?: boolean;
}> &
  HTMLAttributes<SVGElement>;

const makeBlipSvg = (
  { moved, ring: { color: ringColor, id }, title, visible }: Blip,
  {
    muted,
    selected,
    zoomed,
  }: {
    muted?: boolean;
    selected?: boolean;
    zoomed?: boolean;
  },
) => {
  const sharedClasses = cn(
    'cursor-pointer [transition-property:opacity,stroke] duration-200',
    !visible && 'opacity-10',
    visible && muted && !selected && 'opacity-30',
    visible && (!muted || selected) && 'opacity-100',
  );

  const fillStyle = color(ringColor).hex();

  const getTextY = () => {
    if (!moved) {
      return undefined;
    }
    return moved > 0 ? 2 : -2;
  };

  const text = zoomed ? (
    <>
      <clipPath id={`clip-${id}`}>
        <circle r={BLIP_RADIUS - 1} />
      </clipPath>
      <text
        className="pointer-events-none select-none fill-white text-[5px] font-semibold tracking-tighter"
        clipPath={`url(#clip-${id})`}
        dominantBaseline="middle"
        textAnchor="middle"
        y={getTextY()}
      >
        {title.length <= 5 ? title : `${title.slice(0, 4)}..`}
      </text>
    </>
  ) : null;

  if (moved) {
    return (
      <g>
        <path
          className={sharedClasses}
          d={moved > 0 ? 'M -11,5 11,5 0,-13 z' : 'M -11,-5 11,-5 0,13 z'}
          fill={fillStyle}
        />
        <path
          className={cn(
            sharedClasses,
            'duration-100',
            selected ? 'opacity-100' : 'opacity-0',
          )}
          d={moved > 0 ? 'M -11,5 11,5 0,-13 z' : 'M -11,-5 11,-5 0,13 z'}
          strokeWidth={1.5}
          style={{
            fill: 'none',
            stroke: fillStyle,
          }}
          transform="scale(1.3)"
        />
        {text}
      </g>
    );
  }

  return (
    <g>
      <circle
        className={cn(
          sharedClasses,
          'duration-100',
          selected ? 'opacity-100' : 'opacity-0',
        )}
        r={BLIP_RADIUS - 1 + 2}
        strokeWidth={2}
        style={{
          fill: 'none',
          stroke: fillStyle,
        }}
      />
      <circle className={sharedClasses} r={BLIP_RADIUS - 1} fill={fillStyle} />
      {text}
    </g>
  );
};

export const RadarBlip = forwardRef<SVGGElement, RadarBlipProps>(
  (props, ref) => {
    const { blip, muted, selected, ...svgProps } = props;

    const { focusedQuadrant } = useContext(RadarFilterContext);

    const zoomed = focusedQuadrant?.id === blip.quadrant.id;

    const blipSvg = makeBlipSvg(blip, {
      muted,
      selected,
      zoomed,
    });

    return (
      <g
        data-testid="radar-entry"
        ref={ref}
        transform={`translate(${blip.x}, ${blip.y}) scale(${
          zoomed ? 1.05 : 1
        })`}
        {...svgProps}
      >
        {blipSvg}
      </g>
    );
  },
);

RadarBlip.displayName = 'RadarBlip';
