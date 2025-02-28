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

/**
 * @public
 * Represents a Jira issue.
 */
export type Issue = {
  id: string;
  self: string;
  key: string;
  summary: string;
  assignee: string;
  labels: string[];
  issuetype: string;
  status: {
    [key: string]: string;
  };
  timespent: string;
  created: string;
  updated: string;
  subtasks?: Issue[];
};

/**
 * @public
 *
 * Represents the details of an Epic in Jira.
 */
export type EpicDetails = {
  issues: Issue[];
};

/**
 * @public
 *
 * Represents a property value with a text field.
 */
export type PropertyValue = {
  _text: string;
};

/**
 * @public
 *
 * Represents an entry in the activity stream.
 */
export type ActivityStreamEntry = {
  id: PropertyValue;
  updated: PropertyValue;
  title: PropertyValue;
};

/**
 * @public
 *
 * Represents an element in the activity stream.
 */
export type ActivityStreamElement = {
  time: {
    value: string;
  };
  title: string;
};

/**
 * @public
 *
 * Represents the keys used in the activity stream.
 */
export type ActivityStreamKeys = 'updated' | 'title' | 'id';
