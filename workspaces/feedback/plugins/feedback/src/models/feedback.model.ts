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
export enum FeedbackCategory {
  BUG = 'BUG',
  FEEDBACK = 'FEEDBACK',
}

export type FeedbackType = {
  feedbackId: string;
  summary: string;
  projectId: string;
  description: string;
  url: string;
  userAgent: string;
  tag: string;
  ticketUrl: string;
  feedbackType: FeedbackCategory;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
};
