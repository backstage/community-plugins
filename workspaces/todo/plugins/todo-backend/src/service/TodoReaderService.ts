/*
 * Copyright 2021 The Backstage Authors
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

import { InputError, NotFoundError } from '@backstage/errors';
import { CatalogApi } from '@backstage/catalog-client';
import {
  getEntitySourceLocation,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  createServiceFactory,
  createServiceRef,
  ServiceRef,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import { TodoReader, todoReaderServiceRef } from '../lib';
import { ListTodosRequest, ListTodosResponse, TodoService } from './types';

const DEFAULT_DEFAULT_PAGE_SIZE = 10;
const DEFAULT_MAX_PAGE_SIZE = 50;

/** @public */
export type TodoReaderServiceOptions = {
  todoReader: TodoReader;
  catalogClient: CatalogApi;
  maxPageSize?: number;
  defaultPageSize?: number;
};

function wildcardRegex(str: string): RegExp {
  const pattern = str
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${pattern}$`, 'i');
}

/** @public */
export class TodoReaderService implements TodoService {
  private readonly todoReader: TodoReader;
  private readonly catalogClient: CatalogApi;
  private readonly maxPageSize: number;
  private readonly defaultPageSize: number;

  constructor(options: TodoReaderServiceOptions) {
    this.todoReader = options.todoReader;
    this.catalogClient = options.catalogClient;
    this.maxPageSize = options.maxPageSize ?? DEFAULT_MAX_PAGE_SIZE;
    this.defaultPageSize = options.defaultPageSize ?? DEFAULT_DEFAULT_PAGE_SIZE;
  }

  async listTodos(
    req: ListTodosRequest,
    options?: { token?: string },
  ): Promise<ListTodosResponse> {
    if (!req.entity) {
      throw new InputError('Entity filter is required to list TODOs');
    }
    const token = options?.token;
    const entity = await this.catalogClient.getEntityByRef(req.entity, {
      token,
    });
    if (!entity) {
      throw new NotFoundError(
        `Entity not found, ${stringifyEntityRef(req.entity)}`,
      );
    }
    const entitySourceLocation = getEntitySourceLocation(entity);
    if (entitySourceLocation.type !== 'url') {
      throw new InputError(
        `Invalid entity location type for ${stringifyEntityRef(entity)}, got '${
          entitySourceLocation.type
        }' for location ${entitySourceLocation.target}`,
      );
    }
    const url = entitySourceLocation.target;
    const todos = await this.todoReader.readTodos({ url });

    let limit = req.limit ?? this.defaultPageSize;
    if (limit < 0) {
      limit = 0;
    } else if (limit > this.maxPageSize) {
      limit = this.maxPageSize;
    }

    let offset = req.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    let items = todos.items;
    const { orderBy, filters } = req;

    if (filters) {
      for (const { field, value } of filters) {
        const pattern = wildcardRegex(value);
        items = items.filter(item => item[field]?.match(pattern));
      }
    }

    if (orderBy) {
      const dir = orderBy.direction === 'asc' ? 1 : -1;
      const field = orderBy.field;
      items = items.slice().sort((item1, item2) => {
        const field1 = item1[field];
        const field2 = item2[field];

        if (field1 && field2) {
          return dir * field1.localeCompare(field2, 'en-US');
        } else if (field1 && !field2) {
          return -1;
        } else if (!field1 && field2) {
          return 1;
        }
        return 0;
      });
    }

    return {
      items: items.slice(offset, offset + limit),
      totalCount: items.length,
      offset,
      limit,
    };
  }
}

export const todoServiceRef: ServiceRef<TodoService> =
  createServiceRef<TodoService>({
    id: 'todo.client',
    defaultFactory: async service =>
      createServiceFactory({
        service,
        deps: {
          catalogApi: catalogServiceRef,
          todoReader: todoReaderServiceRef,
        },
        async factory({ catalogApi, todoReader }) {
          const todoReaderService = new TodoReaderService({
            catalogClient: catalogApi,
            todoReader,
          });
          return todoReaderService;
        },
      }),
  });
