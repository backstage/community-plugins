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

import { categorizeDocuments } from './SyncCategorizer';
import type { FetchedDocument } from '../../types';
import { FileFormat } from '@backstage-community/plugin-agentic-chat-common';
import type { DocumentInfo } from '@backstage-community/plugin-agentic-chat-common';

function doc(
  fileName: string,
  contentHash?: string,
  sourceId = `source://${fileName}`,
): FetchedDocument {
  return {
    fileName,
    content: `content of ${fileName}`,
    sourceId,
    sourceType: 'directory',
    contentHash,
  };
}

function existing(fileName: string, id: string): DocumentInfo {
  return {
    id,
    fileName,
    format: FileFormat.TEXT,
    fileSize: 0,
    uploadedAt: new Date().toISOString(),
    status: 'completed',
  };
}

describe('categorizeDocuments', () => {
  it('puts new documents in toAdd', () => {
    const fetched = [doc('new.md', 'hash1')];
    const existingMap = new Map<string, DocumentInfo>();
    const cache = new Map<string, string>();

    const result = categorizeDocuments(fetched, existingMap, cache);

    expect(result.toAdd).toHaveLength(1);
    expect(result.toAdd[0].fileName).toBe('new.md');
    expect(result.toUpdate).toHaveLength(0);
    expect(result.unchanged).toHaveLength(0);
  });

  it('puts changed documents in toUpdate', () => {
    const fetched = [doc('existing.md', 'newHash')];
    const existingMap = new Map([
      ['existing.md', existing('existing.md', 'id1')],
    ]);
    const cache = new Map([['source://existing.md', 'oldHash']]);

    const result = categorizeDocuments(fetched, existingMap, cache);

    expect(result.toAdd).toHaveLength(0);
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].fileName).toBe('existing.md');
    expect(result.unchanged).toHaveLength(0);
  });

  it('puts unchanged documents (matching hash) in unchanged', () => {
    const fetched = [doc('existing.md', 'sameHash')];
    const existingMap = new Map([
      ['existing.md', existing('existing.md', 'id1')],
    ]);
    const cache = new Map([['source://existing.md', 'sameHash']]);

    const result = categorizeDocuments(fetched, existingMap, cache);

    expect(result.toAdd).toHaveLength(0);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.unchanged).toEqual(['existing.md']);
  });

  it('puts documents without contentHash in unchanged', () => {
    const fetched = [{ ...doc('existing.md'), contentHash: undefined }];
    const existingMap = new Map([
      ['existing.md', existing('existing.md', 'id1')],
    ]);
    const cache = new Map<string, string>();

    const result = categorizeDocuments(fetched, existingMap, cache);

    expect(result.toAdd).toHaveLength(0);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.unchanged).toEqual(['existing.md']);
  });

  it('puts documents with no cached hash in unchanged', () => {
    const fetched = [doc('existing.md', 'currentHash')];
    const existingMap = new Map([
      ['existing.md', existing('existing.md', 'id1')],
    ]);
    const cache = new Map<string, string>();

    const result = categorizeDocuments(fetched, existingMap, cache);

    expect(result.toAdd).toHaveLength(0);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.unchanged).toEqual(['existing.md']);
  });

  it('categorizes mixed documents correctly', () => {
    const fetched = [
      doc('new.md', 'hash1'),
      doc('changed.md', 'newHash'),
      doc('unchanged.md', 'sameHash'),
    ];
    const existingMap = new Map([
      ['changed.md', existing('changed.md', 'id2')],
      ['unchanged.md', existing('unchanged.md', 'id3')],
    ]);
    const cache = new Map([
      ['source://changed.md', 'oldHash'],
      ['source://unchanged.md', 'sameHash'],
    ]);

    const result = categorizeDocuments(fetched, existingMap, cache);

    expect(result.toAdd).toHaveLength(1);
    expect(result.toAdd[0].fileName).toBe('new.md');
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].fileName).toBe('changed.md');
    expect(result.unchanged).toEqual(['unchanged.md']);
  });
});
