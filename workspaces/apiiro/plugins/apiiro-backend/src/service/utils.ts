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
import { Response as ExpressResponse } from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import { ApiiroNotConfiguredError } from './utils/errors';

/**
 * Unified error response structure for all API endpoints
 */
export interface UnifiedErrorResponse {
  error: string;
  details: {
    status: number;
    error: string;
    [key: string]: any;
  };
}

/**
 * Creates a unified error response following the standard structure
 */
export function createUnifiedErrorResponse(
  statusCode: number,
  errorMessage: string,
  additionalDetails?: any,
): UnifiedErrorResponse {
  return {
    error: errorMessage,
    details: {
      status: statusCode,
      error: errorMessage,
      ...(additionalDetails && additionalDetails),
    },
  };
}

/**
 * Common error handling utility for API endpoints with unified response structure
 */
export function handleApiError(
  err: any,
  res: ExpressResponse,
  logger: LoggerService,
  endpoint: string,
): void {
  logger.error(`${endpoint} - Error details:`, {
    message: err.message,
    status: err.status,
    statusText: err.statusText,
    stack: err.stack,
    data: err.data,
  });

  // Check if it's an API error with status code
  if (err.status) {
    const statusCode = err.status;
    let errorMessage: string;
    const additionalDetails = err.data;

    // Map status codes to standard error messages
    switch (statusCode) {
      case 400:
        errorMessage = 'Bad Request';
        break;
      case 401:
        errorMessage = 'Unauthorized';
        break;
      case 403:
        errorMessage = 'Forbidden';
        break;
      case 404:
        errorMessage = 'Not Found';
        break;
      case 429:
        errorMessage = 'Too Many Requests';
        break;
      case 500:
        errorMessage = 'Internal Server Error';
        break;
      case 502:
        errorMessage = 'Bad Gateway';
        break;
      case 503:
        errorMessage = 'Service Unavailable';
        break;
      case 504:
        errorMessage = 'Gateway Timeout';
        break;
      default:
        errorMessage = err.message || 'API Error';
    }

    // Send appropriate status code with unified response
    if (statusCode >= 500) {
      // For server errors from upstream APIs, map to 502 Bad Gateway
      res
        .status(502)
        .json(
          createUnifiedErrorResponse(502, 'Bad Gateway', additionalDetails),
        );
    } else {
      res
        .status(statusCode)
        .json(
          createUnifiedErrorResponse(
            statusCode,
            errorMessage,
            additionalDetails,
          ),
        );
    }
  } else if (err instanceof ApiiroNotConfiguredError) {
    // Apiiro not configured - return 401
    logger.warn(`${endpoint} - Apiiro not configured:`, {
      message: err.message,
    });
    const errorResponse = createUnifiedErrorResponse(401, 'Unauthorized', {
      message: err.message,
    });
    res.status(401).json(errorResponse);
  } else {
    // Generic error for non-API errors
    logger.error(`${endpoint} - Non-API error:`, err);
    const errorResponse = createUnifiedErrorResponse(
      500,
      'Internal Server Error',
      { message: err.message },
    );
    res.status(500).json(errorResponse);
  }
}

/**
 * Common API fetch function with error handling and timeout
 */
export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  fetchFn: typeof fetch = fetch,
): Promise<Response> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetchFn(url, {
      ...options,
      signal: abortController.signal,
    });

    if (!response.ok) {
      const error = new Error(`Apiiro API error: ${response.status}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;

      // Try to get error details from response body
      try {
        const errorData = await response.json();
        (error as any).data = errorData;
      } catch {
        // If response body is not JSON, ignore
      }

      throw error;
    }

    return response;
  } catch (error) {
    // Check if the error is due to timeout/abort
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error(
        `Request timed out after ${timeoutMs}ms while calling ${url}`,
      );
      (timeoutError as any).status = 504; // Gateway Timeout
      (timeoutError as any).isTimeout = true;
      (timeoutError as any).originalError = error;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Common pagination logic for fetching all pages
 * Includes safety limit to prevent infinite loops
 */
export async function fetchAllPages<T>(
  fetchPageFn: (
    pageCursor?: string,
  ) => Promise<{ items: T[]; next?: string | null }>,
  maxPages: number = 1000,
): Promise<{ items: T[]; totalCount: number }> {
  let next: string | undefined | null = undefined;
  const items: T[] = [];
  let pageCount = 0;

  do {
    pageCount++;

    if (pageCount > maxPages) {
      throw new Error(
        `Pagination limit exceeded: Maximum of ${maxPages} pages allowed. This may indicate an infinite loop or an unexpectedly large dataset.`,
      );
    }

    const page = await fetchPageFn(next ?? undefined);
    items.push(...page.items);
    next = page.next;
  } while (next);

  return { items, totalCount: items.length };
}

/**
 * Common URL building utility for API endpoints
 */
export function buildApiUrl(
  baseUrl: string,
  path: string,
  params: Record<string, string | string[] | undefined> = {},
  pageCursor?: string,
): string {
  const url = new URL(path, baseUrl);

  // Add common parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(`${key}[]`, v));
      } else {
        url.searchParams.append(key, value);
      }
    }
  });

  if (pageCursor) {
    url.searchParams.append('next', pageCursor);
  }

  return url.toString();
}

/**
 * Common filter building utility for API parameters
 */
export function buildFilterParams(
  filters: Record<string, string[] | undefined>,
): Record<string, string[]> {
  const params: Record<string, string[]> = {};

  Object.entries(filters).forEach(([key, values]) => {
    if (values && values.length > 0) {
      params[`filters[${key}]`] = values;
    }
  });

  return params;
}

/**
 * Common validation function for repositoryKey and entityRef
 * Returns validated parameters or sends error response
 */
export function validateRepositoryParams(
  params: { repositoryKey?: unknown; entityRef?: unknown },
  res: ExpressResponse,
  logger: LoggerService,
  endpoint: string,
): params is { repositoryKey: string; entityRef: string } {
  const { repositoryKey, entityRef } = params;
  const missingFields: string[] = [];

  if (
    !repositoryKey ||
    typeof repositoryKey !== 'string' ||
    repositoryKey.trim() === ''
  ) {
    missingFields.push('repositoryKey');
  }
  if (!entityRef || typeof entityRef !== 'string' || entityRef.trim() === '') {
    missingFields.push('entityRef');
  }

  if (missingFields.length > 0) {
    logger.warn(`${endpoint} - Missing or invalid required fields:`, {
      missingFields,
      providedRepositoryKey:
        typeof repositoryKey === 'string' ? repositoryKey : undefined,
      providedEntityRef: typeof entityRef === 'string' ? entityRef : undefined,
    });
    res
      .status(400)
      .json(
        createUnifiedErrorResponse(
          400,
          `Missing or invalid required fields: ${missingFields.join(', ')}`,
        ),
      );
    return false;
  }

  return true;
}
