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
import {
  groupByPath,
  buildFileStructure,
  formatInitialData,
  getObjectsAtPath,
} from './FileExplorer';

const dummyFiles = [
  {
    filename: 'dir1/file1',
    files: [],
    coverage: 75,
    missing: 1,
    tracked: 4,
    path: '',
  },
  {
    filename: 'dir1/file2',
    files: [],
    coverage: 50,
    missing: 3,
    tracked: 6,
    path: '',
  },
  {
    filename: 'dir2/file3',
    files: [],
    coverage: 100,
    missing: 0,
    tracked: 2,
    path: '',
  },
  {
    filename: 'dir3/dir2/dir1/file4',
    files: [],
    coverage: 0,
    missing: 5,
    tracked: 5,
    path: '',
  },
  {
    filename: 'dir3/dir2/dir3/file4',
    files: [],
    coverage: 100,
    missing: 0,
    tracked: 5,
    path: '',
  },
];

const dummyDataGroupedByPath = {
  dir1: [
    {
      filename: 'dir1/file1',
      files: [],
      coverage: 75,
      missing: 1,
      tracked: 4,
      path: '',
    },
    {
      filename: 'dir1/file2',
      files: [],
      coverage: 50,
      missing: 3,
      tracked: 6,
      path: '',
    },
  ],
  dir2: [
    {
      filename: 'dir2/file3',
      files: [],
      coverage: 100,
      missing: 0,
      tracked: 2,
      path: '',
    },
  ],
  dir3: [
    {
      filename: 'dir3/dir2/dir1/file4',
      files: [],
      coverage: 0,
      missing: 5,
      tracked: 5,
      path: '',
    },
    {
      filename: 'dir3/dir2/dir3/file4',
      files: [],
      coverage: 100,
      missing: 0,
      tracked: 5,
      path: '',
    },
  ],
};

const coverageTableRow = {
  files: dummyFiles,
  coverage: (13 / 22) * 100,
  missing: 9,
  tracked: 22,
  path: '',
};

const coverageTableRowResults = {
  files: [
    {
      path: 'dir1',
      files: [
        {
          path: 'file1',
          files: [],
          coverage: 75,
          missing: 1,
          tracked: 4,
        },
        {
          path: 'file2',
          files: [],
          coverage: 50,
          missing: 3,
          tracked: 6,
        },
      ],
      coverage: 60,
      missing: 4,
      tracked: 10,
    },
    {
      path: 'dir2',
      files: [
        {
          path: 'file3',
          files: [],
          coverage: 100,
          missing: 0,
          tracked: 2,
        },
      ],
      coverage: 100,
      missing: 0,
      tracked: 2,
    },
    {
      path: 'dir3',
      files: [
        {
          path: 'dir2',
          files: [
            {
              path: 'dir1',
              files: [
                {
                  path: 'file4',
                  files: [],
                  coverage: 0,
                  missing: 5,
                  tracked: 5,
                },
              ],
              coverage: 0,
              missing: 5,
              tracked: 5,
            },
            {
              path: 'dir3',
              files: [
                {
                  path: 'file4',
                  files: [],
                  coverage: 100,
                  missing: 0,
                  tracked: 5,
                },
              ],
              coverage: 100,
              missing: 0,
              tracked: 5,
            },
          ],
          coverage: 50,
          missing: 5,
          tracked: 10,
        },
      ],
      coverage: 50,
      missing: 5,
      tracked: 10,
    },
  ],
  coverage: (13 / 22) * 100,
  missing: 9,
  tracked: 22,
  path: '',
};

const pathTestLeaf = {
  files: [],
  coverage: 75,
  missing: 1,
  tracked: 4,
  path: 'file5',
};

const dummyFilesPathTest = {
  files: [
    ...dummyFiles,
    {
      ...pathTestLeaf,
      filename: 'dir3/dir7/file5',
    },
  ],
  coverage: (16 / 26) * 100,
  missing: 10,
  tracked: 26,
  path: '',
};

describe('groupByPath function', () => {
  it('should group files by their root directory,as per their filename', () => {
    expect(groupByPath(dummyFiles)).toStrictEqual(dummyDataGroupedByPath);
  });
});

describe('buildFileStructure function', () => {
  it('should group files by their root directory,as per their filename', () => {
    expect(buildFileStructure(coverageTableRow)).toStrictEqual(
      coverageTableRowResults,
    );
  });

  it('should compute folder coverage from line counts, not by averaging files', () => {
    const structure = buildFileStructure({
      files: [
        {
          filename: 'src/a.ts',
          files: [],
          coverage: 100,
          missing: 0,
          tracked: 5,
          path: '',
        },
        {
          filename: 'src/b.ts',
          files: [],
          coverage: 40,
          missing: 1200,
          tracked: 2000,
          path: '',
        },
        {
          filename: 'empty/c.ts',
          files: [],
          coverage: 0,
          missing: 0,
          tracked: 0,
          path: '',
        },
      ],
      coverage: (805 / 2005) * 100,
      missing: 1200,
      tracked: 2005,
      path: '',
    });

    const [src, empty] = structure.files;
    expect(src.missing).toBe(1200);
    expect(src.tracked).toBe(2005);
    expect(src.coverage).toBeCloseTo(40.15, 2);
    expect(empty.coverage).toBe(0);
  });
});

describe('formatInitialData function', () => {
  it('should not round file coverage down', () => {
    const structure = formatInitialData({
      aggregate: { line: { percentage: 66.67, missed: 1, available: 3 } },
      files: [
        {
          filename: 'src/a.ts',
          lineHits: { 1: 1, 2: 4, 3: 0 },
          branchHits: {},
        },
      ],
    });

    const [src] = structure.files;
    expect(src.coverage).toBeCloseTo(66.67, 2);
    expect(src.files[0].coverage).toBeCloseTo(66.67, 2);
  });
});

describe('getObjectsAtPath function', () => {
  const structure = buildFileStructure(dummyFilesPathTest);

  it('should return the the dirs/files at the given path', () => {
    expect(getObjectsAtPath(structure, ['dir3', 'dir7'])).toStrictEqual([
      pathTestLeaf,
    ]);
  });

  it('should return undefined for a nonexistent path', () => {
    expect(
      getObjectsAtPath(structure, ['dir3', 'doesnt-exist']),
    ).toBeUndefined();
  });
});
