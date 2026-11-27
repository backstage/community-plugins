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

import { BLIP_RADIUS } from './radarPlotUtils';

type Point = Readonly<{
  x: number;
  y: number;
}>;

type PolarPoint = Readonly<{
  r: number;
  t: number;
}>;

export const cartesian = ({ r, t }: PolarPoint): Point => {
  return {
    x: r * Math.cos(t),
    y: r * Math.sin(t),
  };
};

const polar = ({ x, y }: Point): PolarPoint => {
  return {
    r: Math.sqrt(x * x + y * y),
    t: Math.atan2(y, x),
  };
};

const boundedInterval = (value: number, min: number, max: number): number => {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.min(Math.max(value, low), high);
};

const boundedBox = (point: Point, min: Point, max: Point): Point => {
  return {
    x: boundedInterval(point.x, min.x, max.x),
    y: boundedInterval(point.y, min.y, max.y),
  };
};

const boundedRing = (
  polarValue: PolarPoint,
  rMin: number,
  rMax: number,
): PolarPoint => {
  return {
    r: boundedInterval(polarValue.r, rMin, rMax),
    t: polarValue.t,
  };
};

export class Segment {
  private readonly cartesianMax: Point;
  private readonly cartesianMin: Point;
  private readonly nextSeed: () => number;
  private readonly polarMax: PolarPoint;
  private readonly polarMin: PolarPoint;

  public constructor({
    nextSeed,
    quadrant,
    radius,
    ring,
  }: {
    nextSeed: () => number;
    quadrant: Quadrant;
    radius: number;
    ring: Ring;
  }) {
    this.nextSeed = nextSeed;
    this.polarMin = {
      r: ring.innerRadius,
      t: quadrant.radialMin,
    };
    this.polarMax = {
      r: ring.outerRadius,
      t: quadrant.radialMax,
    };
    this.cartesianMin = {
      x: BLIP_RADIUS * quadrant.offsetX,
      y: BLIP_RADIUS * quadrant.offsetY,
    };
    this.cartesianMax = {
      x: radius * quadrant.offsetX,
      y: radius * quadrant.offsetY,
    };
  }

  public clipx(d: Point): number {
    const c = boundedBox(d, this.cartesianMin, this.cartesianMax);
    const p = boundedRing(
      polar(c),
      this.polarMin.r + BLIP_RADIUS,
      this.polarMax.r - BLIP_RADIUS,
    );
    return cartesian(p).x;
  }

  public clipy(d: Point): number {
    const c = boundedBox(d, this.cartesianMin, this.cartesianMax);
    const p = boundedRing(
      polar(c),
      this.polarMin.r + BLIP_RADIUS,
      this.polarMax.r - BLIP_RADIUS,
    );
    return cartesian(p).y;
  }

  public randomPoint(): Point {
    return cartesian({
      r: this.normalBetween(this.polarMin.r, this.polarMax.r),
      t: this.randomBetween(this.polarMin.t, this.polarMax.t),
    });
  }

  private normalBetween(min: number, max: number): number {
    return min + (this.random() + this.random()) * 0.5 * (max - min);
  }

  // custom random number generator, to make random sequence reproducible
  // source: https://stackoverflow.com/questions/521295
  private random(): number {
    const x = Math.sin(this.nextSeed()) * 10000;
    return x - Math.floor(x);
  }

  private randomBetween(min: number, max: number): number {
    return min + this.random() * (max - min);
  }
}
