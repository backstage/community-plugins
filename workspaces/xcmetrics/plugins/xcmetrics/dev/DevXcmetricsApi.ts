/*
 * Copyright 2021 The Backstage Authors
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

import { DateTime } from 'luxon';
import {
  Build,
  BuildCount,
  BuildError,
  BuildFilters,
  BuildHost,
  BuildMetadata,
  BuildResponse,
  BuildStatus,
  BuildStatusResult,
  BuildTime,
  BuildWarning,
  PaginationResult,
  Target,
  XcmetricsApi,
  Xcode,
} from '../src/api';

/**
 * A self-contained, in-memory implementation of the {@link XcmetricsApi} used
 * to run the plugin locally without a real XCMetrics backend. The data is
 * generated deterministically so that charts and tables stay stable between
 * reloads while still looking realistic.
 */

// Deterministic pseudo-random generator (mulberry32) so the dev data does not
// jump around on every render/reload.
const createRandom = (seed: number) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const rand = createRandom(20210101);

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(rand() * items.length)];

const between = (min: number, max: number): number =>
  min + rand() * (max - min);

const intBetween = (min: number, max: number): number =>
  Math.floor(between(min, max + 1));

const PROJECTS = ['iOS-App', 'PaymentsKit', 'DesignSystem', 'AnalyticsSDK'];
const SCHEMAS = ['Debug', 'Release', 'Beta', 'Staging'];
const USERS = ['alex', 'jordan', 'sam', 'taylor', 'casey'];
const MACHINES = [
  'Alex-MacBookPro',
  'CI-Runner-01',
  'CI-Runner-02',
  'Jordan-MacStudio',
];
const CATEGORIES = ['noop', 'incremental', 'clean'];
const STATUS_WEIGHTS: BuildStatus[] = [
  'succeeded',
  'succeeded',
  'succeeded',
  'succeeded',
  'succeeded',
  'succeeded',
  'succeeded',
  'failed',
  'failed',
  'stopped',
];

const TOTAL_BUILDS = 220;
const HISTORY_DAYS = 60;

const pad = (value: number): string => value.toString().padStart(4, '0');

const makeId = (prefix: string, index: number): string =>
  `${prefix}_${pad(index)}-A1B2-C3D4-E5F6-${pad(index)}XCMETRICS`;

const createBuild = (index: number): Build => {
  const daysAgo = Math.floor((index / TOTAL_BUILDS) * HISTORY_DAYS);
  const start = DateTime.now()
    .minus({ days: daysAgo })
    .set({ hour: intBetween(8, 19), minute: intBetween(0, 59), second: 0 });

  const buildStatus = pick(STATUS_WEIGHTS);
  const duration = Math.round(between(25, 540) * 100) / 100;
  const compilationDuration =
    Math.round(duration * between(0.55, 0.9) * 100) / 100;
  const end = start.plus({ seconds: duration });
  const compilationEnd = start.plus({ seconds: compilationDuration });

  return {
    id: makeId('B', index),
    userid: pick(USERS),
    userid256: makeId('U', index),
    projectName: pick(PROJECTS),
    schema: pick(SCHEMAS),
    machineName: pick(MACHINES),
    category: pick(CATEGORIES),
    tag: '',
    isCi: rand() > 0.5,
    wasSuspended: rand() > 0.95,
    buildStatus,
    errorCount: buildStatus === 'failed' ? intBetween(1, 6) : 0,
    warningCount: intBetween(0, 14),
    compiledCount: intBetween(12, 480),
    duration,
    compilationDuration,
    day: start.toISODate()!,
    startTimestamp: start.toISO({ suppressMilliseconds: true })!,
    endTimestamp: end.toISO({ suppressMilliseconds: true })!,
    compilationEndTimestamp: compilationEnd.toISO({
      suppressMilliseconds: true,
    })!,
    startTimestampMicroseconds: start.toSeconds(),
    endTimestampMicroseconds: end.toSeconds(),
    compilationEndTimestampMicroseconds: compilationEnd.toSeconds(),
  };
};

// Builds, newest first.
const BUILDS: Build[] = Array.from({ length: TOTAL_BUILDS }, (_, index) =>
  createBuild(index),
);

const createTargets = (build: Build): Target[] => {
  const targetNames = [
    'Networking',
    'Models',
    'DesignSystem',
    'Analytics',
    'Persistence',
    'Feature-Login',
    'Feature-Checkout',
    'App',
  ];
  const count = intBetween(5, targetNames.length);
  let cursor = build.startTimestampMicroseconds;

  return Array.from({ length: count }, (_, index) => {
    const targetDuration = between(0.5, build.duration / count);
    const compileDuration = targetDuration * between(0.4, 0.85);
    const startMicro = cursor;
    const endMicro = startMicro + targetDuration;
    const compilationEndMicro = startMicro + compileDuration;
    cursor = endMicro;

    return {
      id: `${build.id}_T${pad(index)}`,
      name: targetNames[index],
      category: pick(CATEGORIES),
      buildIdentifier: build.id,
      fetchedFromCache: rand() > 0.85,
      errorCount: index === count - 1 ? build.errorCount : 0,
      warningCount: intBetween(0, 4),
      compiledCount: intBetween(1, 60),
      duration: targetDuration,
      compilationDuration: compileDuration,
      day: build.day,
      startTimestamp: DateTime.fromSeconds(startMicro).toISO({
        suppressMilliseconds: true,
      })!,
      endTimestamp: DateTime.fromSeconds(endMicro).toISO({
        suppressMilliseconds: true,
      })!,
      compilationEndTimestamp: DateTime.fromSeconds(compilationEndMicro).toISO({
        suppressMilliseconds: true,
      })!,
      startTimestampMicroseconds: startMicro,
      endTimestampMicroseconds: endMicro,
      compilationEndTimestampMicroseconds: compilationEndMicro,
    };
  });
};

const createXcode = (build: Build): Xcode => ({
  id: `${build.id}_XCODE`,
  buildIdentifier: build.id,
  buildNumber: '15A240d',
  version: '1520',
  day: build.day,
});

const createErrors = (build: Build): BuildError[] =>
  Array.from({ length: build.errorCount }, (_, index) => ({
    id: `${build.id}_E${pad(index)}`,
    buildIdentifier: build.id,
    parentIdentifier: `${build.id}_T0007`,
    parentType: 'step',
    type: 'clangError',
    title: "Use of undeclared identifier 'paymentToken'",
    detail: `/Users/${build.userid}/${build.projectName}/Sources/Checkout.swift:142:18: error: use of undeclared identifier 'paymentToken'\n        return paymentToken\n               ^~~~~~~~~~~~\n`,
    severity: 2,
    startingLine: 142,
    endingLine: 142,
    startingColumn: 18,
    endingColumn: 30,
    characterRangeStart: 0,
    characterRangeEnd: 4096,
    documentURL: `file:///Users/${build.userid}/${build.projectName}/Sources/Checkout.swift`,
    day: build.day,
  }));

const createWarnings = (build: Build): BuildWarning[] =>
  Array.from({ length: Math.min(build.warningCount, 6) }, (_, index) => ({
    id: `${build.id}_W${pad(index)}`,
    buildIdentifier: build.id,
    parentIdentifier: `${build.id}_T000${index % 8}`,
    parentType: 'step',
    type: 'deprecatedWarning',
    title:
      "'UIApplication.keyWindow' is deprecated: first deprecated in iOS 13.0",
    detail: null,
    clangFlag: '[-Wdeprecated-declarations]',
    severity: 1,
    startingLine: 58 + index,
    endingLine: 58 + index,
    startingColumn: 22,
    endingColumn: 44,
    characterRangeStart: 0,
    characterRangeEnd: 2048,
    documentURL: `file:///Users/${build.userid}/${build.projectName}/Sources/AppDelegate.swift`,
    day: build.day,
  }));

const createHost = (build: Build): BuildHost => ({
  id: `${build.id}_HOST`,
  buildIdentifier: build.id,
  hostOs: 'macOS',
  hostOsFamily: 'Darwin',
  hostOsVersion: '14.4.1',
  hostArchitecture: 'arm64',
  hostModel: 'Mac14,12',
  cpuModel: 'Apple M2 Pro',
  cpuCount: 12,
  cpuSpeedGhz: 3.5,
  memoryTotalMb: 32768,
  memoryFreeMb: Math.round(between(2048, 16384)),
  swapTotalMb: 8192,
  swapFreeMb: Math.round(between(512, 8192)),
  uptimeSeconds: intBetween(3600, 1_500_000),
  isVirtual: build.machineName.startsWith('CI'),
  timezone: 'CET',
  day: build.day,
});

const createMetadata = (build: Build): BuildMetadata => ({
  ciProvider: build.isCi ? 'GitHubActions' : 'local',
  branch: build.isCi ? 'main' : `feature/${build.userid}-work`,
  commit: build.id.slice(2, 12).toLowerCase(),
  pullRequest: build.isCi ? `#${intBetween(100, 999)}` : 'n/a',
  xcodeVersion: '15.2',
});

const filterByDate = (builds: Build[], filters: BuildFilters): Build[] => {
  const from = DateTime.fromISO(filters.from).startOf('day');
  const to = DateTime.fromISO(filters.to).endOf('day');

  return builds.filter(build => {
    const day = DateTime.fromISO(build.startTimestamp);
    if (day < from || day > to) return false;
    if (filters.buildStatus && build.buildStatus !== filters.buildStatus) {
      return false;
    }
    if (filters.project && build.projectName !== filters.project) {
      return false;
    }
    return true;
  });
};

/** A fully functional, in-memory XCMetrics API for local development. */
export class DevXcmetricsApi implements XcmetricsApi {
  async getBuild(id: string): Promise<BuildResponse> {
    const build = BUILDS.find(b => b.id === id) ?? BUILDS[0];
    return {
      build,
      targets: createTargets(build),
      xcode: createXcode(build),
    };
  }

  async getBuilds(limit: number = 10): Promise<Build[]> {
    return BUILDS.slice(0, limit);
  }

  async getFilteredBuilds(
    filters: BuildFilters,
    page: number = 1,
    perPage: number = 10,
  ): Promise<PaginationResult<Build>> {
    const filtered = filterByDate(BUILDS, filters);
    const start = (page - 1) * perPage;

    return {
      items: filtered.slice(start, start + perPage),
      metadata: {
        per: perPage,
        page,
        total: filtered.length,
      },
    };
  }

  async getBuildErrors(buildId: string): Promise<BuildError[]> {
    const build = BUILDS.find(b => b.id === buildId);
    return build ? createErrors(build) : [];
  }

  async getBuildCounts(days: number): Promise<BuildCount[]> {
    return Array.from({ length: days }, (_, index) => {
      const builds = intBetween(8, 60);
      return {
        day: DateTime.now()
          .minus({ days: days - index - 1 })
          .toISODate()!,
        builds,
        errors: intBetween(0, Math.ceil(builds / 4)),
      };
    });
  }

  async getBuildHost(buildId: string): Promise<BuildHost> {
    const build = BUILDS.find(b => b.id === buildId) ?? BUILDS[0];
    return createHost(build);
  }

  async getBuildMetadata(buildId: string): Promise<BuildMetadata> {
    const build = BUILDS.find(b => b.id === buildId) ?? BUILDS[0];
    return createMetadata(build);
  }

  async getBuildTimes(days: number): Promise<BuildTime[]> {
    return Array.from({ length: days }, (_, index) => {
      const durationP50 = Math.round(between(45, 160) * 100) / 100;
      const durationP95 =
        Math.round(durationP50 * between(1.4, 2.6) * 100) / 100;
      return {
        day: DateTime.now()
          .minus({ days: days - index - 1 })
          .toISODate()!,
        durationP50,
        durationP95,
        totalDuration: Math.round(durationP50 * intBetween(8, 60) * 100) / 100,
      };
    });
  }

  async getBuildStatuses(limit: number): Promise<BuildStatusResult[]> {
    return BUILDS.slice(0, limit).map(({ id, buildStatus }) => ({
      id,
      buildStatus,
    }));
  }

  async getBuildWarnings(buildId: string): Promise<BuildWarning[]> {
    const build = BUILDS.find(b => b.id === buildId);
    return build ? createWarnings(build) : [];
  }

  async getProjects(): Promise<string[]> {
    return [...PROJECTS];
  }
}
