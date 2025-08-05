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
import { rest } from 'msw';

const LOCAL_ADDR = 'https://localhost:4000';

export const handlers = [
  rest.get(`${LOCAL_ADDR}/api/status`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/status.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/auth/info`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/auth_info.json`)),
    );
  }),
  rest.post(`${LOCAL_ADDR}/api/authenticate`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/config/authenticated.json`)),
    );
  }),
  rest.get(`${LOCAL_ADDR}/api/namespaces`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(require(`${__dirname}/data/namespaces.json`)),
    );
  }),
];
