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
import type { Quadrant, Ring } from '../../types';

import { Radar } from '../RadarPlot/Radar';
import { cn } from '../../util/cn';

import color from 'color';
import { Link } from '@backstage/ui';

type Props = Readonly<{
  highlighted?: string;
  quadrants: Quadrant[];
  rings: Ring[];
}>;

export const RingLegend = (props: Props) => {
  const { highlighted, quadrants, rings } = props;

  return (
    <div className={cn('flex flex-col gap-2')}>
      {rings.map(({ id, name, color: ringColor, description }) => {
        const textColor = color(ringColor).hex();
        const isHighlighted = highlighted === id;

        return (
          <div
            className={cn(
              'flex items-start gap-4 p-2',
              isHighlighted
                ? 'border-primary/40 bg-muted/70 shadow-sm'
                : 'border-border bg-card hover:bg-muted/40',
            )}
            key={id}
          >
            <div className="mt-0.5 basis-[10%] border border-gray-300 bg-card p-2">
              <Radar
                highlightRing={id}
                isInLegend
                quadrants={quadrants}
                rings={rings}
              />
            </div>

            <div className="flex-1 space-y-0.5">
              <h3
                className={cn(
                  'text-lg font-semibold capitalize tracking-tight',
                )}
                style={{ color: textColor }}
              >
                {name}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description ? (
                  description
                ) : (
                  <>
                    {
                      'You add a description to this ring by modifying the tech radar file. '
                    }
                    <Link
                      target="_blank"
                      href="https://github.com/backstage/community-plugins/blob/main/workspaces/tech-radar/plugins/tech-radar/README.md#ring"
                    >
                      Schema help.
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
