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

import { formatByteSize } from './utils';

describe('formatByteSize', () => {
  it('should return N/A if sizeInBytes is not defined', () => {
    expect(formatByteSize(undefined)).toEqual('N/A');
  });

  it('should return N/A if sizeInBytes is 0', () => {
    expect(formatByteSize(0)).toEqual('N/A');
  });

  it('should format sizeInBytes', () => {
    expect(formatByteSize(1)).toEqual('1 B');
    expect(formatByteSize(1_000)).toEqual('1 kB');
    expect(formatByteSize(1_000_000)).toEqual('1 MB');
    expect(formatByteSize(1_000_000_000)).toEqual('1 GB');
    expect(formatByteSize(1_000_000_000_000)).toEqual('1 TB');
    expect(formatByteSize(1_000_000_000_000_000)).toEqual('1 PB');
    expect(formatByteSize(1_000_000_000_000_000_000)).toEqual('1 EB');
    expect(formatByteSize(1_000_000_000_000_000_000_000)).toEqual('1 ZB');
    expect(formatByteSize(1_000_000_000_000_000_000_000_000)).toEqual('1 YB');
  });

  it('formats common sizes correctly', () => {
    expect(formatByteSize(500)).toEqual('500 B');
    expect(formatByteSize(1500)).toMatch('1.5 kB');
    expect(formatByteSize(1048576)).toMatch('1.05 MB');
  });
});
