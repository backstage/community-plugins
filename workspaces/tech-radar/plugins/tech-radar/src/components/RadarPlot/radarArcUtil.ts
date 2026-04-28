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
import { cartesian } from './segment';

export const UPPERCASE_TEXT_BASELINE_COMPENSATION = 1;

export const describeArc = ({
  endAngle,
  innerRadius,
  outerRadius,
  startAngle,
}: {
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
}) => {
  const start = cartesian({ r: outerRadius, t: endAngle });
  const end = cartesian({ r: outerRadius, t: startAngle });
  const innerStart = cartesian({ r: innerRadius, t: endAngle });
  const innerEnd = cartesian({ r: innerRadius, t: startAngle });

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    start.x,
    start.y,
    'A',
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'L',
    innerEnd.x,
    innerEnd.y,
    'A',
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    1,
    innerStart.x,
    innerStart.y,
    'Z',
  ].join(' ');
};

export const describeArcTextLine = ({
  endAngle,
  radius,
  reverse = false,
  startAngle,
}: {
  endAngle: number;
  radius: number;
  reverse?: boolean;
  startAngle: number;
}) => {
  const start = cartesian({
    r: radius,
    t: reverse ? startAngle : endAngle,
  });
  const end = cartesian({
    r: radius,
    t: reverse ? endAngle : startAngle,
  });

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  const sweepFlag = reverse ? '1' : '0';

  const baselineCompensationAmount = Math.sqrt(radius * 2);

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius +
      (reverse
        ? UPPERCASE_TEXT_BASELINE_COMPENSATION * baselineCompensationAmount
        : 0),
    radius +
      (reverse
        ? UPPERCASE_TEXT_BASELINE_COMPENSATION * baselineCompensationAmount
        : 0),
    0,
    largeArcFlag,
    sweepFlag,
    end.x,
    end.y,
  ].join(' ');
};
