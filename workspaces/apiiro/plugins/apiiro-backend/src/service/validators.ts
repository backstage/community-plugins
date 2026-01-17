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
import { z } from 'zod';
import { ApiiroRepositoriesPage, ApiiroRisksPage } from './data.service.types';

/**
 * Maximum allowed length for string inputs to prevent abuse
 */
const MAX_STRING_LENGTH = 3000;
const MAX_FILTER_ARRAY_LENGTH = 100;

/**
 * Trims whitespace from string array elements and removes empty strings
 */
function trimAndFilterArray(arr: string[]): string[] {
  return arr.map(s => s.trim()).filter(s => s.length > 0);
}

export const ApiiroRepositoryModuleSchema = z.object({
  filePath: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
});

export const ApiiroRepositorySchema = z
  .object({
    activeSince: z.string().nullable().optional(),
    apiCount: z.number().optional(),
    branchName: z.string().nullable().optional(),
    businessImpact: z.string().nullable().optional(),
    contributorCount: z.number().optional(),
    dependencyCount: z.number().optional(),
    hasDataModels: z.boolean().optional(),
    hasExternalDependencies: z.boolean().optional(),
    hasPaymentsData: z.boolean().optional(),
    hasPhiData: z.boolean().optional(),
    hasPiiData: z.boolean().optional(),
    hasSensitiveDependencies: z.boolean().optional(),
    insights: z.array(z.string()).nullable().optional(),
    isActive: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    isDeployed: z.boolean().optional(),
    isInternetExposed: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    key: z.string().nullable().optional(),
    languages: z.array(z.string()).nullable().optional(),
    lastActivity: z.string().nullable().optional(),
    licenses: z.array(z.string()).nullable().optional(),
    modules: z.array(ApiiroRepositoryModuleSchema).nullable().optional(),
    name: z.string().nullable().optional(),
    projectId: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
    riskLevel: z.string().nullable().optional(),
    riskScore: z.number().optional(),
    scmRepositoryKey: z.string().nullable().optional(),
    serverUrl: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
  })
  .nonstrict();

export const ApiiroRepositoriesPageSchema = z.object({
  next: z.string().nullable().optional(),
  items: z.array(ApiiroRepositorySchema),
});

export function parseApiiroRepositoriesPage(
  input: unknown,
): ApiiroRepositoriesPage {
  const parsed = ApiiroRepositoriesPageSchema.parse(input);
  return parsed as ApiiroRepositoriesPage;
}

export const ApiiroRiskInsightSchema = z.object({
  name: z.string().nullable(),
  reason: z.string().nullable(),
});

export const ApiiroRiskSourceSchema = z.object({
  name: z.string().nullable(),
  url: z.string().nullable(),
});

export const ApiiroRiskMonitoringStatusSchema = z.object({
  ignoredBy: z.string().nullable().optional(),
  ignoredOn: z.string().nullable().optional(),
  ignoreReason: z.string().nullable().optional(),
  status: z.string().nullable(),
});

export const ApiiroRiskEntityDetailsSchema = z.object({
  branchName: z.string().nullable().optional(),
  businessImpact: z.string().nullable().optional(),
  isArchived: z.boolean().optional(),
  key: z.string().nullable().optional(),
  monitoringStatus: ApiiroRiskMonitoringStatusSchema.nullable().optional(),
  name: z.string().nullable().optional(),
  privacySettings: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional(),
  repositoryGroup: z.string().nullable().optional(),
  repositoryOwners: z.array(z.any()).nullable().optional(),
  riskLevel: z.string().nullable().optional(),
  serverUrl: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export const ApiiroRiskEntitySchema = z.object({
  details: ApiiroRiskEntityDetailsSchema,
  type: z.string().nullable(),
});

export const ApiiroRiskContributorSchema = z.object({
  email: z.string().nullable(),
  name: z.string().nullable(),
  reason: z.string().nullable(),
});

export const ApiiroRiskSourceCodeSchema = z.object({
  filePath: z.string().nullable(),
  lineNumber: z.number(),
  url: z.string().nullable(),
});

export const ApiiroRiskSchema = z
  .object({
    id: z.string().nullable().optional(),
    riskLevel: z.string().nullable().optional(),
    riskStatus: z.string().nullable().optional(),
    ruleName: z.string().nullable().optional(),
    riskCategory: z.string().nullable().optional(),
    component: z.string().nullable().optional(),
    discoveredOn: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    insights: z.array(ApiiroRiskInsightSchema).nullable().optional(),
    apiiroRiskUrl: z.string().nullable().optional(),
    source: z.array(ApiiroRiskSourceSchema).nullable().optional(),
    entity: ApiiroRiskEntitySchema.nullable().optional(),
    applications: z.array(z.any()).nullable().optional(),
    orgTeams: z.array(z.any()).nullable().optional(),
    applicationGroups: z.array(z.any()).nullable().optional(),
    sourceCode: ApiiroRiskSourceCodeSchema.nullable().optional(),
    contributors: z.array(ApiiroRiskContributorSchema).nullable().optional(),
    actionsTaken: z.array(z.any()).nullable().optional(),
    findingCategory: z.string().nullable().optional(),
    findingName: z.string().nullable().optional(),
    policyTags: z.array(z.string()).nullable().optional(),
    repositoryTags: z.array(z.any()).nullable().optional(),
    applicationTags: z.array(z.any()).nullable().optional(),
    orgTeamTags: z.array(z.any()).nullable().optional(),
  })
  .nonstrict();

export const ApiiroRisksPageSchema = z.object({
  next: z.string().nullable().optional(),
  items: z.array(ApiiroRiskSchema),
});

export function parseApiiroRisksPage(input: unknown): ApiiroRisksPage {
  const parsed = ApiiroRisksPageSchema.parse(input);
  return parsed as ApiiroRisksPage;
}

// Risk Filters validation schema with enhanced validation
export const RiskFiltersSchema = z
  .object({
    repositoryId: z.string().max(MAX_STRING_LENGTH).optional(),
    RiskCategory: z
      .array(z.string().max(MAX_STRING_LENGTH))
      .max(MAX_FILTER_ARRAY_LENGTH)
      .optional(),
    RiskInsight: z
      .array(z.string().max(MAX_STRING_LENGTH))
      .max(MAX_FILTER_ARRAY_LENGTH)
      .optional(),
    FindingCategory: z
      .array(z.string().max(MAX_STRING_LENGTH))
      .max(MAX_FILTER_ARRAY_LENGTH)
      .optional(),
    RiskLevel: z
      .array(z.string().max(MAX_STRING_LENGTH))
      .max(MAX_FILTER_ARRAY_LENGTH)
      .optional(),
    DiscoveredOn: z
      .object({
        start: z.string().max(MAX_STRING_LENGTH).optional(),
        end: z.string().max(MAX_STRING_LENGTH).optional(),
      })
      .optional(),
  })
  .strict();

export function validateRiskFilters(filters: unknown): {
  isValid: boolean;
  errors: string[];
  validatedFilters?: any;
} {
  try {
    // Validate the overall structure
    const result = RiskFiltersSchema.safeParse(filters);

    if (!result.success) {
      const errors = result.error.errors.map(err => {
        if (err.code === 'unrecognized_keys') {
          const invalidKeys = err.keys.join(', ');
          return `Invalid filter keys: ${invalidKeys}. Only repositoryId, RiskCategory, RiskInsight, FindingCategory, RiskLevel, and DiscoveredOn are allowed (case-sensitive).`;
        }
        if (err.code === 'too_big') {
          return `${err.path.join('.')}: Array exceeds maximum length of ${
            err.maximum
          } items`;
        }
        return `${err.path.join('.')}: ${err.message}`;
      });
      return { isValid: false, errors };
    }

    const validatedFilters = result.data;
    const additionalErrors: string[] = [];

    // Trim and validate array filters
    if (validatedFilters.RiskCategory) {
      validatedFilters.RiskCategory = trimAndFilterArray(
        validatedFilters.RiskCategory,
      );
      if (validatedFilters.RiskCategory.length === 0) {
        additionalErrors.push(
          'RiskCategory array cannot be empty after trimming',
        );
      }
    }
    if (validatedFilters.RiskInsight) {
      validatedFilters.RiskInsight = trimAndFilterArray(
        validatedFilters.RiskInsight,
      );
      if (validatedFilters.RiskInsight.length === 0) {
        additionalErrors.push(
          'RiskInsight array cannot be empty after trimming',
        );
      }
    }
    if (validatedFilters.FindingCategory) {
      validatedFilters.FindingCategory = trimAndFilterArray(
        validatedFilters.FindingCategory,
      );
      if (validatedFilters.FindingCategory.length === 0) {
        additionalErrors.push(
          'FindingCategory array cannot be empty after trimming',
        );
      }
    }
    if (validatedFilters.RiskLevel) {
      validatedFilters.RiskLevel = trimAndFilterArray(
        validatedFilters.RiskLevel,
      );
      if (validatedFilters.RiskLevel.length === 0) {
        additionalErrors.push('RiskLevel array cannot be empty after trimming');
      }
    }

    // Trim repositoryId if present
    if (validatedFilters.repositoryId) {
      validatedFilters.repositoryId = validatedFilters.repositoryId.trim();
      if (validatedFilters.repositoryId.length === 0) {
        additionalErrors.push('repositoryId cannot be empty after trimming');
      }
    }

    // Additional validation for DiscoveredOn
    if (validatedFilters.DiscoveredOn) {
      const { start, end } = validatedFilters.DiscoveredOn;

      // Both start and end keys must exist (but can be empty strings for open-ended ranges)
      if (start === undefined || end === undefined) {
        additionalErrors.push(
          'DiscoveredOn filter requires both start and end keys (use empty string for open-ended ranges)',
        );
      } else {
        // Trim date strings
        const trimmedStart = start.trim();
        const trimmedEnd = end.trim();
        validatedFilters.DiscoveredOn.start = trimmedStart;
        validatedFilters.DiscoveredOn.end = trimmedEnd;

        // Validate date format only if the value is not an empty string
        const dateRegex =
          /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
        if (trimmedStart !== '' && !dateRegex.test(trimmedStart)) {
          additionalErrors.push(
            'DiscoveredOn.start must be in valid date format (YYYY-MM-DD or ISO format) or empty string',
          );
        }
        if (trimmedEnd !== '' && !dateRegex.test(trimmedEnd)) {
          additionalErrors.push(
            'DiscoveredOn.end must be in valid date format (YYYY-MM-DD or ISO format) or empty string',
          );
        }

        // Validate date range logic: start should be before or equal to end
        if (trimmedStart !== '' && trimmedEnd !== '') {
          const startDate = new Date(trimmedStart);
          const endDate = new Date(trimmedEnd);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            additionalErrors.push('DiscoveredOn dates must be valid dates');
          } else if (startDate > endDate) {
            additionalErrors.push(
              'DiscoveredOn.start must be before or equal to DiscoveredOn.end',
            );
          }

          // Validate reasonable date range (not more than 10 years)
          const tenYearsInMs = 10 * 365 * 24 * 60 * 60 * 1000;
          if (endDate.getTime() - startDate.getTime() > tenYearsInMs) {
            additionalErrors.push(
              'DiscoveredOn date range cannot exceed 10 years',
            );
          }
        }
      }
    }

    if (additionalErrors.length > 0) {
      return { isValid: false, errors: additionalErrors };
    }

    return { isValid: true, errors: [], validatedFilters };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Filter validation error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}

// Repository Filters validation schema
export const RepositoryFiltersSchema = z
  .object({
    repositoryKey: z.string().max(MAX_STRING_LENGTH).optional(),
    entityRef: z.string().max(MAX_STRING_LENGTH).optional(),
  })
  .strict();

export function validateRepositoryFilters(filters: unknown): {
  isValid: boolean;
  errors: string[];
  validatedFilters?: any;
} {
  try {
    // Validate the overall structure
    const result = RepositoryFiltersSchema.safeParse(filters);

    if (!result.success) {
      const errors = result.error.errors.map(err => {
        if (err.code === 'unrecognized_keys') {
          const invalidKeys = err.keys.join(', ');
          return `Invalid filter keys: ${invalidKeys}. Only repositoryKey is allowed.`;
        }
        return `${err.path.join('.')}: ${err.message}`;
      });
      return { isValid: false, errors };
    }

    const validatedFilters = result.data;
    const additionalErrors: string[] = [];

    // Validate and normalize repositoryUrl if present
    if (validatedFilters.repositoryKey) {
      const trimmedRepositoryKey = validatedFilters.repositoryKey.trim();

      if (trimmedRepositoryKey.length === 0) {
        additionalErrors.push('repositoryKey cannot be empty after trimming');
      } else {
        validatedFilters.repositoryKey = trimmedRepositoryKey;
      }
    }

    if (additionalErrors.length > 0) {
      return { isValid: false, errors: additionalErrors };
    }

    return { isValid: true, errors: [], validatedFilters };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Filter validation error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}
