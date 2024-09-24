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
import { FeedbackCategory, FeedbackModel } from '../model/feedback.model';

export const mockFeedback: FeedbackModel = {
  feedbackId: 'bubuPsc93VRYAwByZe8ZQ9',
  summary: 'Unit Test Issue',
  description: 'This is mock description',
  tag: 'UI Issues',
  projectId: 'component:default/example-website',
  ticketUrl: 'https://demo-ticket-url/ticket-id',
  feedbackType: FeedbackCategory.BUG,
  createdBy: 'user:default/guest',
  url: 'http://localhost:3000/catalog/default/component/example-website/feedback',
  userAgent:
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
};
