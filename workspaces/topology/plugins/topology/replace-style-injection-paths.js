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
const fs = require('fs');
const glob = require('glob');

const files = glob.sync('dist/**/*.css.esm.js');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /(\.\.\/)+node_modules\/style-inject\/dist\/style-inject\.es\.esm\.js/g,
    'style-inject',
  );
  fs.writeFileSync(file, content, 'utf8');
});
