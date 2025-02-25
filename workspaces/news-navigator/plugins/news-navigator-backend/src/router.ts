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
import express from 'express';
import Router from 'express-promise-router';
import { NewsAPIService } from './services/NewsAPIService/types';

export async function createRouter({
  newsAPIService,
}: {
  newsAPIService: NewsAPIService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  // Ping endpoint for health checks
  router.get('/ping', (_req, res) => {
    res.status(200).send('pong');
  });

  // ** NewsAPI Routes ** //

  // Get news by category
  router.get('/category/:category', async (req, res) => {
    res.json(await newsAPIService.getNewsByCategory(req.params.category));
  });

  // Search news by keyword
  router.get('/search/:keyword', async (req, res) => {
    res.json(await newsAPIService.searchNewsByKeyword(req.params.keyword));
  });

  return router;
}
