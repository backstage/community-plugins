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
import { TemplateAction } from '@backstage/plugin-scaffolder-node';

import {
  createRecordAction,
  deleteRecordAction,
  modifyRecordAction,
  retrieveRecordAction,
  retrieveRecordsAction,
  updateRecordAction,
} from '.';
import { CreateActionOptions } from '../../../types';

/**
 * Returns all ServiceNow `now` namespace `Table API` actions.
 * @public
 * @returns TemplateAction[]
 */
export function createTableActions(
  options: CreateActionOptions,
): TemplateAction[] {
  return [
    createRecordAction(options),
    deleteRecordAction(options),
    modifyRecordAction(options),
    retrieveRecordAction(options),
    retrieveRecordsAction(options),
    updateRecordAction(options),
  ] as TemplateAction[];
}

export * from './create-record';
export * from './delete-record';
export * from './modify-record';
export * from './retrieve-record';
export * from './retrieve-records';
export * from './update-record';
