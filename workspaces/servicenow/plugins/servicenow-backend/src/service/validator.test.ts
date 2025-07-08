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
import { InputError } from '@backstage/errors';
import { validateIncidentQueryParams } from './validator';
import { ParsedQs } from 'qs';

describe('validateIncidentQueryParams', () => {
  it('should validate with userEmail only', () => {
    const query = { userEmail: 'test@example.com' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({
      userEmail: 'test@example.com',
    });
  });

  it('should validate with entityId only', () => {
    const query = { entityId: '123' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({ entityId: '123' });
  });

  it('should throw InputError when neither userEmail nor entityId is provided', () => {
    const query = {} as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError('entityId is required if userEmail is not present.'),
    );
  });

  it('should allow both userEmail and entityId', () => {
    const query = {
      userEmail: 'test@example.com',
      entityId: '123',
    } as ParsedQs;
    const result = validateIncidentQueryParams(query);
    expect(result).toEqual({
      userEmail: 'test@example.com',
      entityId: '123',
    });
  });

  it('should throw InputError for invalid userEmail format', () => {
    const query = { userEmail: 'invalid-email' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError('userEmail must be a valid email address.'),
    );
  });

  it('should validate limit correctly', () => {
    const query = { entityId: '123', limit: '10' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({
      entityId: '123',
      limit: 10,
    });
  });

  it('should throw InputError for invalid limit', () => {
    const query = { entityId: '123', limit: 'abc' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError('limit must be a non-negative integer.'),
    );

    const query2 = { entityId: '123', limit: '-10' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError('limit must be a non-negative integer.'),
    );
    expect(() => validateIncidentQueryParams(query2)).toThrow(
      new InputError('limit must be a non-negative integer.'),
    );
  });

  it('should validate offset correctly', () => {
    const query = { entityId: '123', offset: '5' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({
      entityId: '123',
      offset: 5,
    });
  });

  it('should throw InputError for invalid offset', () => {
    const query = { entityId: '123', offset: 'xyz' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError('offset must be a non-negative integer.'),
    );

    const query2 = { entityId: '123', offset: '-5' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError('offset must be a non-negative integer.'),
    );
    expect(() => validateIncidentQueryParams(query2)).toThrow(
      new InputError('offset must be a non-negative integer.'),
    );
  });

  it('should validate order correctly', () => {
    const query = { entityId: '123', order: 'asc' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({
      entityId: '123',
      order: 'asc',
    });

    const query2 = { entityId: '123', order: 'desc' } as ParsedQs;
    expect(validateIncidentQueryParams(query2)).toEqual({
      entityId: '123',
      order: 'desc',
    });
  });

  it('should throw InputError for invalid order', () => {
    const query = { entityId: '123', order: 'invalid' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError("order must be 'asc' or 'desc'."),
    );
  });

  it('should validate orderBy correctly', () => {
    const query = { entityId: '123', orderBy: 'number' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({
      entityId: '123',
      orderBy: 'number',
    });
  });

  it('should throw InputError for invalid orderBy', () => {
    const query = { entityId: '123', orderBy: 'invalid' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError(
        'Invalid orderBy field. Allowed values are: number, short_description, description, sys_created_on, priority, incident_state, url',
      ),
    );
  });

  it('should validate state correctly', () => {
    const query = { entityId: '123', state: 'IN1,2,3' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({
      entityId: '123',
      state: 'IN1,2,3',
    });
  });

  it('should throw InputError for invalid state', () => {
    const query = { entityId: '123', state: 'invalid' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError(
        "Query parameter 'state' must use the 'IN' prefix format (e.g., 'INvalue1,value2' or 'INvalue').",
      ),
    );

    const query2 = { entityId: '123', state: 'IN1,2,invalid' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError(
        "Query parameter 'state' must use the 'IN' prefix format (e.g., 'INvalue1,value2' or 'INvalue').",
      ),
    );
    expect(() => validateIncidentQueryParams(query2)).toThrow(
      new InputError(
        "Invalid value 'invalid' for query parameter 'state' in 'IN' list 'IN1,2,invalid'. Allowed values are: 1, 2, 3, 6, 7, 8.",
      ),
    );
  });

  it('should validate priority correctly', () => {
    const query = { entityId: '123', priority: 'IN1,2,3' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({
      entityId: '123',
      priority: 'IN1,2,3',
    });
  });

  it('should throw InputError for invalid priority', () => {
    const query = { entityId: '123', priority: 'invalid' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError(
        "Query parameter 'priority' must use the 'IN' prefix format (e.g., 'INvalue1,value2' or 'INvalue').",
      ),
    );

    const query2 = { entityId: '123', priority: 'IN1,2,invalid' } as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError(
        "Query parameter 'priority' must use the 'IN' prefix format (e.g., 'INvalue1,value2' or 'INvalue').",
      ),
    );
    expect(() => validateIncidentQueryParams(query2)).toThrow(
      new InputError(
        "Invalid value 'invalid' for query parameter 'priority' in 'IN' list 'IN1,2,invalid'. Allowed values are: 1, 2, 3, 4, 5.",
      ),
    );
  });

  it('should validate search correctly', () => {
    const query = { entityId: '123', search: 'test search' } as ParsedQs;
    expect(validateIncidentQueryParams(query)).toEqual({
      entityId: '123',
      search: 'test search',
    });
  });

  it('should throw InputError for invalid search', () => {
    const query = { entityId: '123', search: 123 } as unknown as ParsedQs;
    expect(() => validateIncidentQueryParams(query)).toThrow(
      new InputError('search must be a string.'),
    );
  });
});
