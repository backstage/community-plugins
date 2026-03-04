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
import type { PropsWithChildren } from 'react';
import { useContext, useId } from 'react';

import type { Quadrant, Ring } from '../../types';
import { RadarBlip } from '../RadarBlip/RadarBlip';
import { RadarFilterContext } from '../RadarFilterContext';

import {
  describeArc,
  describeArcTextLine,
  UPPERCASE_TEXT_BASELINE_COMPENSATION,
} from './radarArcUtil';
import { QUADRANT_GAP, RADAR_DIAMETER, RADAR_PADDING } from './radarPlotUtils';
import { cn } from '../../util/cn';
import { useComponents } from '../hooks/useComponents';
import { Focusable } from 'react-aria-components';
import color from 'color';

type RadarProps = Readonly<{
  highlightRing?: string;
  isInLegend?: boolean;
  loading?: boolean;
  onClick?: () => void;
  quadrants: Quadrant[];
  rings: Ring[];
}>;

const maxRadius = RADAR_DIAMETER / 2;
const viewBoxSize = RADAR_DIAMETER + RADAR_PADDING;
const centerX = 0;
const centerY = 0;

export const Radar = ({
  children,
  highlightRing,
  isInLegend,
  loading,
  onClick,
  quadrants,
  rings,
}: PropsWithChildren<RadarProps>) => {
  const { focusedQuadrant } = useContext(RadarFilterContext);

  const halfViewBox = viewBoxSize / 2;
  const focusedSize = RADAR_DIAMETER / 2 + QUADRANT_GAP * 2;
  const adjustedViewBoxSize = focusedQuadrant ? focusedSize : viewBoxSize;

  const viewBoxMinX = focusedQuadrant
    ? Math.min(focusedQuadrant.offsetX, 0) * focusedSize
    : -halfViewBox;

  const viewBoxMinY = focusedQuadrant
    ? Math.min(focusedQuadrant.offsetY, 0) * focusedSize +
      -focusedQuadrant.offsetY * (QUADRANT_GAP - 5)
    : -halfViewBox;

  return (
    <svg
      className={cn(
        'select-none font-sans max-h-[calc(100vh-300px)]',
        loading ? 'animate-pulse' : '',
      )}
      onClick={onClick}
      viewBox={`${viewBoxMinX} ${viewBoxMinY} ${adjustedViewBoxSize} ${adjustedViewBoxSize}`}
    >
      {/* Render Quadrants */}
      {quadrants.map((quadrant, qIndex) => {
        return (
          <g
            className="transition-opacity duration-300"
            key={qIndex}
            transform={`translate(${quadrant.offsetX * QUADRANT_GAP}, ${
              quadrant.offsetY * QUADRANT_GAP
            })`}
          >
            {/* Rings */}
            {rings
              .map((ring, rIndex) => ({ rIndex, ring }))
              .map(({ ring }) => {
                const pathD = describeArc({
                  endAngle: quadrant.radialMin,
                  innerRadius: ring.innerRadius,
                  outerRadius: ring.outerRadius,
                  startAngle: quadrant.radialMax,
                });

                const highlighted = highlightRing === ring.id;
                const highlightColor = highlighted
                  ? color(ring.color).string()
                  : undefined;

                const stroke = isInLegend
                  ? 'stroke-muted-foreground'
                  : 'stroke-border';
                const strokeWidth = isInLegend ? '8' : '1';

                return (
                  <path
                    className={cn('fill-card', stroke)}
                    d={pathD}
                    key={ring.id}
                    strokeWidth={strokeWidth}
                    style={{ fill: highlightColor }}
                  />
                );
              })}
          </g>
        );
      })}

      <g
        className={cn(
          'transition-opacity duration-300',
          loading ? 'opacity-0' : 'opacity-100',
        )}
      >
        {children}
      </g>
    </svg>
  );
};

type RadarBlipsAndLabelsProps = Readonly<{
  quadrants: Quadrant[];
  rings: Ring[];
}>;

export const RadarBlipsAndLabels = ({
  quadrants,
  rings,
}: RadarBlipsAndLabelsProps) => {
  const { Tooltip, TooltipTrigger } = useComponents();
  const id = useId();
  const {
    blips,
    focusedQuadrant,
    handleSelectedBlip,
    selectedBlip,
    selectedFilters,
    setFocusedQuadrant,
    setSelectedFilters,
  } = useContext(RadarFilterContext);

  const firstLabelXOffset = focusedQuadrant?.offsetX ?? 0;

  return (
    <>
      <defs>
        {quadrants.map((q, i) => {
          const isBottom = i === 0 || i === 1 || i === 4;
          const pathD = describeArcTextLine({
            endAngle: q.radialMin,
            radius: maxRadius * 1.1,
            reverse: isBottom,
            startAngle: q.radialMax,
          });
          return (
            <path
              d={pathD}
              fill="none"
              id={`${id}-label-path-${i}`}
              key={`label-path-${i}`}
            />
          );
        })}
      </defs>
      {
        /* Quadrant Label on Rim */
        quadrants.map((quadrant, qIndex) => (
          <text
            className="cursor-pointer fill-muted-foreground font-light uppercase tracking-[0.4em]"
            key={quadrant.name}
          >
            <textPath
              dominantBaseline="central"
              href={`#${id}-label-path-${qIndex}`}
              onClick={e => {
                e.stopPropagation();
                setFocusedQuadrant(focusedQuadrant ? undefined : quadrant);
              }}
              startOffset="50%"
              textAnchor="middle"
            >
              {quadrant.name}
            </textPath>
          </text>
        ))
      }
      {blips.map(blip => (
        <TooltipTrigger delay={150} key={blip.id}>
          <Focusable excludeFromTabOrder>
            <RadarBlip
              blip={blip}
              className="focus:outline-none"
              data-testid={blip.id}
              muted={!!selectedBlip}
              onClick={e => {
                e.stopPropagation();
                if (selectedBlip?.id === blip.id) {
                  handleSelectedBlip(undefined);
                } else {
                  if (selectedBlip || !blip.visible) {
                    setSelectedFilters(
                      selectedFilters.filter(f => !f.startsWith('ring:')),
                    );
                  }
                  handleSelectedBlip(blip);
                }
              }}
              selected={selectedBlip?.id === blip.id}
            />
          </Focusable>

          <Tooltip
            placement="top"
            offset={-4}
            containerPadding={0}
            style={{ zIndex: 99 }}
          >
            {blip.title}
          </Tooltip>
        </TooltipTrigger>
      ))}

      {/* Ring Labels (Horizontal Axis) */}
      {rings.map((ring, i) => {
        const r = (ring.innerRadius + ring.outerRadius) / 2;

        if (i === 0) {
          return (
            <text
              className="cursor-pointer fill-muted-foreground align-middle text-[12px] uppercase"
              dominantBaseline="central"
              key={`ring-label-${i}`}
              textAnchor="middle"
              x={centerX + firstLabelXOffset * r}
              y={centerY + UPPERCASE_TEXT_BASELINE_COMPENSATION}
            >
              {ring.name}
            </text>
          );
        }

        return (
          <g key={`ring-labels-${i}`}>
            {/* Right Axis Label */}
            <text
              className="cursor-pointer fill-muted-foreground text-[12px] uppercase"
              dominantBaseline="middle"
              textAnchor="middle"
              x={centerX + r + QUADRANT_GAP}
              y={centerY + UPPERCASE_TEXT_BASELINE_COMPENSATION}
            >
              {ring.name}
            </text>
            {/* Left Axis Label */}
            <text
              className="cursor-pointer fill-muted-foreground text-[12px] uppercase"
              dominantBaseline="middle"
              textAnchor="middle"
              x={centerX - (r + QUADRANT_GAP)}
              y={centerY + UPPERCASE_TEXT_BASELINE_COMPENSATION}
            >
              {ring.name}
            </text>
          </g>
        );
      })}
    </>
  );
};
