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
import { JsonValue } from '@backstage/types';
import { FactResponse } from './facts';

/**
 * @public
 *
 * Response type for check links.
 */
export type CheckLink = {
  title: string;
  url: string;
};

export type Check = {
  /**
   * Unique identifier of the check
   *
   * Used to identify which checks to use when running checks.
   */
  id: string;

  /**
   * Type identifier for the check.
   * Can be used to determine storage options, logical routing to correct FactChecker implementation
   * or to help frontend render correct component types based on this
   */
  type: string;

  /**
   * Human readable name of the check, may be displayed in the UI
   */
  name: string;

  /**
   * Human readable description of the check, may be displayed in the UI
   */
  description: string;

  /**
   * A collection of strings referencing fact rows that a check will be run against.
   *
   * References the fact container, aka fact retriever itself which may or may not contain multiple individual facts and values
   */
  factIds: string[];

  /**
   * General Metadata to be returned
   * Can contain links, description texts or other actionable items
   */
  metadata?: Record<string, any>;

  /**
   * Metadata to be returned in case a check has been successfully evaluated
   * Can contain links, description texts or other actionable items
   */
  successMetadata?: Record<string, unknown>;

  /**
   * Metadata to be returned in case a check evaluation has ended in failure
   * Can contain links, description texts or other actionable items
   */
  failureMetadata?: Record<string, unknown>;

  /**
   * An array of links to display for the check, for users to be able to read
   * more about the check.
   */
  links?: CheckLink[];
};

/**
 * @public
 *
 * Response type for checks.
 */
export interface CheckResponse {
  /**
   * Identifier of the Check
   */
  id: string;
  /**
   * Type identifier for the check.
   * Can be used to determine storage options, logical routing to correct FactChecker implementation
   * or to help frontend render correct component types based on this
   */
  type: string;
  /**
   * Human readable name of the Check
   */
  name: string;
  /**
   * Description of the Check
   */
  description: string;

  /**
   * A collection of references to fact rows used to run this checks against
   */
  factIds: string[];

  /**
   * Metadata related to a check.
   * Can contain links, additional description texts and other actionable data.
   *
   * Currently loosely typed, but in the future when patterns emerge, key shapes can be defined
   */
  metadata?: Record<string, any>;

  /**
   * An array of links to display for the check, for users to be able to read
   * more about the check.
   */
  links?: CheckLink[];
}

/**
 * Generic CheckResult
 *
 * Contains information about the facts used to calculate the check result
 * and information about the check itself. Both may include metadata to be able to display additional information.
 * A collection of these should be parseable by the frontend to display scorecards
 *
 * @public
 */
export type CheckResult = {
  facts: FactResponse;
  check: CheckResponse;
  result: JsonValue;
};

/**
 * CheckResult of type Boolean.
 *
 * @public
 */
export interface BooleanCheckResult extends CheckResult {
  result: boolean;
}

/**
 * Response type for bulk check opretation. Contains a list of entities and their respective check results.
 *
 * @public
 */
export type BulkCheckResponse = Array<{
  entity: string;
  results: CheckResult[];
}>;
