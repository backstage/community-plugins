/*
 * Copyright 2025 The Backstage Authors
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
  Entity,
  EntityRelation,
  RELATION_CHILD_OF,
  RELATION_HAS_MEMBER,
  RELATION_HAS_PART,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  RELATION_PARENT_OF,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import { Rank } from '@backstage-community/plugin-tech-insights-maturity-common';
import { getNextRankColor, getSubEntityFilter, pluralize } from './utils';

const relations: EntityRelation[] = [
  {
    type: RELATION_PARENT_OF,
    targetRef: 'group:default/solline-childof-org',
  },
  {
    type: RELATION_CHILD_OF,
    targetRef: 'group:default/testfail-org-parentof-solline',
  },
  {
    type: RELATION_OWNER_OF,
    targetRef: 'domain:default/domain-ownedby-solline',
  },
  {
    type: RELATION_OWNED_BY,
    targetRef: 'domain:default/testfail-solline-owning-domain',
  },
  {
    type: RELATION_HAS_PART,
    targetRef: 'system:default/system-of-domain',
  },
  {
    type: RELATION_HAS_PART,
    targetRef: 'component:default/component-of-system',
  },
  {
    type: RELATION_PART_OF,
    targetRef: 'system:default/testfail-system-having-component',
  },
  {
    type: RELATION_OWNER_OF,
    targetRef: 'component:default/component-ownedby-team',
  },
  {
    type: RELATION_HAS_MEMBER,
    targetRef: 'user:default/testfail-team-member',
  },
];

const mockOrg: Entity = {
  kind: 'Group',
  spec: {
    type: 'organization',
  },
  apiVersion: '',
  metadata: {
    name: 'mock-org',
  },
  relations,
};

const mockSolutionLine: Entity = {
  kind: 'Group',
  spec: {
    type: 'solution-line',
  },
  apiVersion: '',
  metadata: {
    name: 'mock-solution-line',
  },
  relations,
};

const mockTeam: Entity = {
  kind: 'Group',
  spec: {
    type: 'team',
  },
  apiVersion: '',
  metadata: {
    name: 'mock-team',
    title: 'A Entity',
  },
  relations,
};

const mockDomain: Entity = {
  kind: 'Domain',
  apiVersion: '',
  metadata: {
    name: 'mock-domain',
    title: 'Z Entity',
  },
  relations,
};

const mockSystem: Entity = {
  kind: 'System',
  apiVersion: '',
  metadata: {
    name: 'mock-system',
    title: 'Entity B',
  },
  relations,
};

const mockComponent: Entity = {
  kind: 'Component',
  apiVersion: '',
  metadata: {
    name: 'mock-component',
    title: 'Entity A',
  },
  relations,
};

describe('Utility functions', () => {
  describe('getSubEntityFilter()', () => {
    it('should return filter for Organizations when provided a Company', () => {
      expect(getSubEntityFilter(mockOrg)).toEqual({
        type: RELATION_PARENT_OF,
        kind: 'Group',
      });
    });

    it('should return filter for Product Families when provided an Organization', () => {
      expect(getSubEntityFilter(mockSolutionLine)).toEqual({
        type: RELATION_OWNER_OF,
        kind: 'Domain',
      });
    });

    it('should return filter for Products when provided a Product Family', () => {
      expect(getSubEntityFilter(mockDomain)).toEqual({
        type: RELATION_HAS_PART,
        kind: 'System',
      });
    });

    it('should return filter for Components when provided a Product', () => {
      expect(getSubEntityFilter(mockSystem)).toEqual({
        type: RELATION_HAS_PART,
        kind: 'Component',
      });
    });

    it('should return filter for Components when provided a Team', () => {
      expect(getSubEntityFilter(mockTeam)).toEqual({
        type: RELATION_OWNER_OF,
        kind: 'Component',
      });
    });

    it('should return a blank filter when provided a Component', () => {
      expect(getSubEntityFilter(mockComponent)).toEqual({
        type: '',
        kind: '',
      });
    });
  });

  describe('getRankColor()', () => {
    it('should return a string for the correct corresponding colors', () => {
      expect(getNextRankColor(Rank.Stone, Rank.Gold)).toBe('#704A07');
      expect(getNextRankColor(Rank.Silver, Rank.Gold)).toBe('#DEB82D');
      expect(getNextRankColor(Rank.Gold, Rank.Gold)).toBe('limegreen');
    });
  });

  describe('pluralize()', () => {
    it('should return a blank string if the input is 1', () => {
      expect(pluralize(1)).toBe('');
    });
    it('should return an "s" if the input is more than 1', () => {
      expect(pluralize(2)).toBe('s');
    });
  });
});
