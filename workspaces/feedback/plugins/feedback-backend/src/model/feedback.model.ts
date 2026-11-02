/*
 * Copyright 2024 The Backstage Authors
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
/**
 * Category of the feedback (e.g., BUG or FEEDBACK).
 *
 * @public
 */
export enum FeedbackCategory {
  /**
   * Represets a bug report.
   */
  BUG = 'BUG',
  /**
   * Represents a general feedback.
   */
  FEEDBACK = 'FEEDBACK',
}

/**
 * Model representing a feedback entry.
 *
 * @public
 */
export type FeedbackModel = {
  /**
   * Unique identifier of the feedback.
   */
  feedbackId?: string;
  /**
   * A short summary or title of the feedback.
   */
  summary?: string;
  /**
   * The project identifier related to the feedback.
   */
  projectId?: string;
  /**
   * Detailed description of the feedback.
   */
  description?: string;
  /**
   * The page URL where the feedback was submitted.
   */
  url?: string;
  /**
   * The user agent of the user submitting the feedback.
   */
  userAgent?: string;
  /**
   * An optional tag associated with the feedback.
   */
  tag?: string;
  /**
   * An external ticket URL (e.g., Jira issue URL).
   */
  ticketUrl?: string;
  /**
   * The type/category of the feedback.
   */
  feedbackType?: FeedbackCategory;
  /**
   * User reference who created the feedback.
   */
  createdBy?: string;
  /**
   * User reference who last updated the feedback.
   */
  updatedBy?: string;
  /**
   * Creation timestamp of the feedback.
   */
  createdAt?: string;
  /**
   * Last update timestamp of the feedback.
   */
  updatedAt?: string;
};
