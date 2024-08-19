import type { GetRecommendationListRequest } from '@backstage-community/plugin-redhat-resource-optimization-common';

export const DEFAULT_DEBOUNCE_INTERVAL: number = 700;
export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [10, 20, 50, 100];
export const DEFAULT_SORTING_DIRECTION: GetRecommendationListRequest['query']['orderHow'] =
  'desc';
export const DEFAULT_SORTING_COLUMN: GetRecommendationListRequest['query']['orderBy'] =
  'last_reported';
export const DEFAULT_PADDING: 'dense' | 'default' = 'dense';
