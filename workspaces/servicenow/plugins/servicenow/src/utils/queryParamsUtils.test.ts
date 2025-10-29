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

import { buildIncidentQueryParams } from './queryParamsUtils';
import { IncidentTableFieldEnum } from '../types';

describe('buildIncidentQueryParams', () => {
  const baseParams = {
    entityId: 'service-id-123',
    limit: 10,
    offset: 20,
    orderBy: IncidentTableFieldEnum.Priority,
  };

  it('builds params for ascending order', () => {
    const params = buildIncidentQueryParams({
      ...baseParams,
      order: 'asc',
    });

    expect(params.get('entityId')).toBe(`${baseParams.entityId}`);
    expect(params.get('orderBy')).toBe('priority');
    expect(params.get('order')).toBe('asc');
    expect(params.get('limit')).toBe('10');
    expect(params.get('offset')).toBe('20');
    expect(params.has('search')).toBe(false);
  });

  it('builds params for descending order', () => {
    const params = buildIncidentQueryParams({
      ...baseParams,
      order: 'desc',
    });

    expect(params.get('orderBy')).toBe('priority');
    expect(params.get('order')).toBe('desc');
  });

  it('includes search when provided', () => {
    const params = buildIncidentQueryParams({
      ...baseParams,
      order: 'asc',
      search: 'network',
    });

    expect(params.get('search')).toBe('network');
    expect(params.get('entityId')).toBe(`${baseParams.entityId}`);
  });

  it('omits search when not provided', () => {
    const params = buildIncidentQueryParams({
      ...baseParams,
      order: 'asc',
    });

    expect(params.get('entityId')).toBe(`${baseParams.entityId}`);
    expect(params.has('search')).toBe(false);
  });

  it('returns a URLSearchParams instance', () => {
    const params = buildIncidentQueryParams({
      ...baseParams,
      order: 'asc',
    });

    expect(params).toBeInstanceOf(URLSearchParams);
  });
});
