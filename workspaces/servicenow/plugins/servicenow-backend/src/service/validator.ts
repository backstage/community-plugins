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
import type { ParsedQs } from 'qs';
import type { Order } from '@backstage-community/plugin-servicenow-common';
import { IncidentFieldEnum } from '@backstage-community/plugin-servicenow-common';
import { IncidentQueryParams } from '../service-now-rest';

const ALLOWED_STATES: readonly string[] = ['1', '2', '3', '6', '7', '8'];
const ALLOWED_PRIORITIES: readonly string[] = ['1', '2', '3', '4', '5'];
const ALLOWED_ORDER_BY_FIELDS: string[] = Object.values(IncidentFieldEnum);

function parseAndValidateMultiValueQueryParam(
  paramQueryValue: string | string[] | ParsedQs | ParsedQs[] | undefined,
  allowedValues: readonly string[],
  paramName: string,
): string | undefined {
  if (paramQueryValue === undefined || paramQueryValue === null) {
    return undefined;
  }

  if (Array.isArray(paramQueryValue) || typeof paramQueryValue === 'object') {
    throw new InputError(
      `Query parameter '${paramName}' must be a single string.`,
    );
  }

  const valueAsString = String(paramQueryValue);

  if (valueAsString.trim() === '') {
    return undefined;
  }

  if (!valueAsString.startsWith('IN')) {
    throw new InputError(
      `Query parameter '${paramName}' must use the 'IN' prefix format (e.g., 'INvalue1,value2' or 'INvalue').`,
    );
  }

  // Extract the values after the 'IN' prefix
  const valuesStr = valueAsString.substring(2);
  if (!valuesStr) {
    throw new InputError(
      `Query parameter '${paramName}' with 'IN' prefix cannot have empty values.`,
    );
  }

  const items = valuesStr.split(',');
  for (const item of items) {
    const trimmedItem = item.trim();
    if (!trimmedItem) {
      throw new InputError(
        `Invalid ${paramName} format: empty value found in '${valueAsString}'. Allowed values for 'IN' list are: ${allowedValues.join(
          ', ',
        )}.`,
      );
    }

    const isValid = allowedValues.includes(trimmedItem);

    if (!isValid) {
      throw new InputError(
        `Invalid value '${trimmedItem}' for query parameter '${paramName}' in 'IN' list '${valueAsString}'. Allowed values are: ${allowedValues.join(
          ', ',
        )}.`,
      );
    }
  }
  return valueAsString;
}

export function validateIncidentQueryParams(
  query: ParsedQs,
): IncidentQueryParams {
  const {
    entityId: entityIdQuery,
    state: stateQuery,
    priority: priorityQuery,
    search: searchQuery,
    limit: limitQuery,
    offset: offsetQuery,
    order: orderQuery,
    orderBy: orderByQuery,
    userEmail: userEmailQuery,
  } = query;
  const validatedParams: IncidentQueryParams = {};

  // userEmail validation
  if (userEmailQuery !== undefined) {
    if (typeof userEmailQuery !== 'string' || !userEmailQuery.trim()) {
      throw new InputError('userEmail must be a non-empty string.');
    }
    // Basic email format validation
    if (!/.+@.+\..+/.test(userEmailQuery)) {
      throw new InputError('userEmail must be a valid email address.');
    }
    validatedParams.userEmail = userEmailQuery.trim();
  }

  if (entityIdQuery !== undefined) {
    if (typeof entityIdQuery !== 'string' || !entityIdQuery.trim()) {
      throw new InputError('entityId must be a non-empty string.');
    }
    validatedParams.entityId = entityIdQuery.trim();
  }

  if (!validatedParams.userEmail && !validatedParams.entityId) {
    throw new InputError('entityId is required if userEmail is not present.');
  }

  // limit validation
  if (limitQuery !== undefined) {
    if (typeof limitQuery !== 'string') {
      throw new InputError('limit must be a string with number value.');
    }
    const parsedLimit = parseInt(limitQuery, 10);
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      throw new InputError('limit must be a non-negative integer.');
    }
    validatedParams.limit = parsedLimit;
  }

  // offset validation
  if (offsetQuery !== undefined) {
    if (typeof offsetQuery !== 'string') {
      throw new InputError('offset must be a string with number value.');
    }
    const parsedOffset = parseInt(offsetQuery, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      throw new InputError('offset must be a non-negative integer.');
    }
    validatedParams.offset = parsedOffset;
  }

  // order validation
  if (orderQuery !== undefined) {
    if (typeof orderQuery !== 'string') {
      throw new InputError('order must be a string.');
    }
    if (orderQuery !== 'asc' && orderQuery !== 'desc') {
      throw new InputError("order must be 'asc' or 'desc'.");
    }
    validatedParams.order = orderQuery as Order;
  }

  // state validation
  validatedParams.state = parseAndValidateMultiValueQueryParam(
    stateQuery as string | undefined,
    ALLOWED_STATES,
    'state',
  );

  // priority validation
  validatedParams.priority = parseAndValidateMultiValueQueryParam(
    priorityQuery as string | undefined,
    ALLOWED_PRIORITIES,
    'priority',
  );

  // search validation
  if (searchQuery !== undefined) {
    if (typeof searchQuery !== 'string') {
      throw new InputError(`search must be a string.`);
    }
    validatedParams.search = searchQuery;
  }

  // orderBy validation
  if (orderByQuery !== undefined) {
    if (typeof orderByQuery !== 'string') {
      throw new InputError('orderBy must be a string.');
    }
    if (!ALLOWED_ORDER_BY_FIELDS.includes(orderByQuery)) {
      throw new InputError(
        `Invalid orderBy field. Allowed values are: ${ALLOWED_ORDER_BY_FIELDS.join(
          ', ',
        )}`,
      );
    }
    validatedParams.orderBy = orderByQuery;
  }

  return validatedParams;
}
