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

import { downloadLogFile } from './download-log-file-utils';

describe('downloadLogFile', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:http://localhost/blobid');
    URL.revokeObjectURL = jest.fn();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  });

  it('should trigger a file download with correct filename and content', () => {
    const clickMock = jest.fn();
    const link = document.createElement('a');
    link.click = clickMock;

    jest.spyOn(document, 'createElement').mockReturnValue(link);

    downloadLogFile('hello world', 'log.txt');

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(link.download).toBe('log.txt');
    expect(link.href).toBe('blob:http://localhost/blobid');
    expect(clickMock).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
