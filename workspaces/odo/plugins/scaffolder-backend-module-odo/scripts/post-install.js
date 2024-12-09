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
'use strict';

const conf = require('pkg-conf').sync('odo', {
  cwd: process.cwd(),
  defaults: {
    skipDownload: false,
  },
});

if (conf.skipDownload) {
  console.info('Skipping download of odo as requested in package.json');
} else {
  const download = require('./download');
  download().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
