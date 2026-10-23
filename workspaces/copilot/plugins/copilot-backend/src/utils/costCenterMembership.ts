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

export interface GithubUser {
  id: number;
  login: string;
}

export interface CostCenterResource {
  type: string;
  name: string;
  members?: readonly GithubUser[];
  teamId?: number;
  teamCreatedAt?: string;
}

export interface CostCenterWithResources {
  id: string;
  name: string;
  resources: readonly CostCenterResource[];
}

export interface CostCenterMembership {
  costCenterId: string;
  login: string;
}

type Candidate = CostCenterMembership & {
  source: 'User' | 'Team' | 'Org';
  resourceName: string;
  teamId?: number;
  teamCreatedAt?: string;
};

const sourcePrecedence = {
  User: 0,
  Team: 1,
  Org: 2,
} as const;

function compareStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function getTimestamp(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function candidateWins(candidate: Candidate, current: Candidate): boolean {
  const precedence =
    sourcePrecedence[candidate.source] - sourcePrecedence[current.source];
  if (precedence !== 0) {
    return precedence < 0;
  }

  if (candidate.source === 'Team') {
    const candidateCreatedAt = getTimestamp(candidate.teamCreatedAt);
    const currentCreatedAt = getTimestamp(current.teamCreatedAt);

    if (
      candidateCreatedAt !== undefined &&
      currentCreatedAt !== undefined &&
      candidateCreatedAt !== currentCreatedAt
    ) {
      return candidateCreatedAt < currentCreatedAt;
    }

    // Enterprise team creation timestamps are used when available; the
    // numeric team ID is the stable fallback and breaks timestamp ties.
    const candidateTeamId = candidate.teamId ?? Number.POSITIVE_INFINITY;
    const currentTeamId = current.teamId ?? Number.POSITIVE_INFINITY;
    if (candidateTeamId !== currentTeamId) {
      return candidateTeamId < currentTeamId;
    }

    const teamNameOrder = compareStrings(
      candidate.resourceName.toLowerCase(),
      current.resourceName.toLowerCase(),
    );
    if (teamNameOrder !== 0) {
      return teamNameOrder < 0;
    }
  }

  if (candidate.source === 'Org') {
    // GitHub does not specify which organization wins, so use its login as a
    // case-insensitive deterministic tie-break.
    const orgNameOrder = compareStrings(
      candidate.resourceName.toLowerCase(),
      current.resourceName.toLowerCase(),
    );
    if (orgNameOrder !== 0) {
      return orgNameOrder < 0;
    }
  }

  return compareStrings(candidate.costCenterId, current.costCenterId) < 0;
}

export function resolveCostCenterMemberships(
  costCenters: readonly CostCenterWithResources[],
): Map<number, CostCenterMembership> {
  const candidatesByUserId = new Map<number, Candidate>();

  for (const costCenter of costCenters) {
    for (const resource of costCenter.resources) {
      if (
        resource.type !== 'User' &&
        resource.type !== 'Team' &&
        resource.type !== 'Org'
      ) {
        continue;
      }

      for (const member of resource.members ?? []) {
        const candidate: Candidate = {
          costCenterId: costCenter.id,
          login: member.login,
          source: resource.type,
          resourceName: resource.name,
          teamId: resource.type === 'Team' ? resource.teamId : undefined,
          teamCreatedAt:
            resource.type === 'Team' ? resource.teamCreatedAt : undefined,
        };
        const current = candidatesByUserId.get(member.id);

        if (!current || candidateWins(candidate, current)) {
          candidatesByUserId.set(member.id, candidate);
        }
      }
    }
  }

  return new Map(
    [...candidatesByUserId].map(([userId, { costCenterId, login }]) => [
      userId,
      { costCenterId, login },
    ]),
  );
}
