import { FindingSummary } from '@backstage-community/plugin-sonarqube-react';

export interface SonarQubeTableRow {
  resolved: {
    name: string;
    isSonarQubeAnnotationEnabled?: boolean;
    findings?: FindingSummary;
  };
  id: string;
}

export interface EntityLinkProps {
  entityRef: string;
  title: string;
  url: string;
  kind: string;
  namespace: string;
}

/** @public */
export type DuplicationRating = {
  greaterThan: number;
  rating: '1.0' | '2.0' | '3.0' | '4.0' | '5.0';
};

export const defaultDuplicationRatings: DuplicationRating[] = [
  { greaterThan: 0, rating: '1.0' },
  { greaterThan: 3, rating: '2.0' },
  { greaterThan: 5, rating: '3.0' },
  { greaterThan: 10, rating: '4.0' },
  { greaterThan: 20, rating: '5.0' },
];
