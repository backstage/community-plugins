/*
 * Copyright 2024 The Backstage Authors
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
  classifyDeploymentFrequency,
  classifyLeadTime,
  classifyChangeFailureRate,
  classifyMeanTimeToRecovery,
} from './levels';

describe('classifyDeploymentFrequency', () => {
  it('returns elite for multiple deploys per day', () => {
    expect(classifyDeploymentFrequency(5)).toBe('elite');
    expect(classifyDeploymentFrequency(1)).toBe('elite');
  });

  it('returns high for weekly to monthly', () => {
    expect(classifyDeploymentFrequency(0.5)).toBe('high');
    expect(classifyDeploymentFrequency(1 / 7)).toBe('high');
  });

  it('returns medium for monthly to every 6 months', () => {
    expect(classifyDeploymentFrequency(1 / 30)).toBe('medium');
    expect(classifyDeploymentFrequency(1 / 180)).toBe('medium');
  });

  it('returns low for less than once per 6 months', () => {
    expect(classifyDeploymentFrequency(1 / 365)).toBe('low');
    expect(classifyDeploymentFrequency(0)).toBe('low');
  });
});

describe('classifyLeadTime', () => {
  it('returns elite for less than 1 hour', () => {
    expect(classifyLeadTime(0.5)).toBe('elite');
  });

  it('returns high for less than 1 week', () => {
    expect(classifyLeadTime(24)).toBe('high');
    expect(classifyLeadTime(100)).toBe('high');
  });

  it('returns medium for less than 1 month', () => {
    expect(classifyLeadTime(200)).toBe('medium');
    expect(classifyLeadTime(700)).toBe('medium');
  });

  it('returns low for more than 1 month', () => {
    expect(classifyLeadTime(1000)).toBe('low');
  });
});

describe('classifyChangeFailureRate', () => {
  it('returns elite for less than 5%', () => {
    expect(classifyChangeFailureRate(3)).toBe('elite');
  });

  it('returns high for less than 10%', () => {
    expect(classifyChangeFailureRate(7)).toBe('high');
  });

  it('returns medium for less than 15%', () => {
    expect(classifyChangeFailureRate(12)).toBe('medium');
  });

  it('returns low for 15% or more', () => {
    expect(classifyChangeFailureRate(20)).toBe('low');
  });
});

describe('classifyMeanTimeToRecovery', () => {
  it('returns elite for less than 1 hour', () => {
    expect(classifyMeanTimeToRecovery(0.5)).toBe('elite');
  });

  it('returns high for less than 1 day', () => {
    expect(classifyMeanTimeToRecovery(12)).toBe('high');
  });

  it('returns medium for less than 1 week', () => {
    expect(classifyMeanTimeToRecovery(72)).toBe('medium');
  });

  it('returns low for more than 1 week', () => {
    expect(classifyMeanTimeToRecovery(200)).toBe('low');
  });
});
