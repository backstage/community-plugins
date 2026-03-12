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

import { renderHook, act } from '@testing-library/react';
import { useIngestDropZone } from './useIngestDropZone';
import { createApiTestWrapper } from '../../test-utils/renderWithApi';
import type { AgenticChatApi } from '../../api';

function createMockApi(
  overrides: Partial<AgenticChatApi> = {},
): Partial<AgenticChatApi> {
  return {
    uploadDocument: jest
      .fn()
      .mockResolvedValue({ id: 'doc-1', fileName: 'test.txt' }),
    ...overrides,
  };
}

function createFileList(files: File[]): FileList {
  const list = {
    length: files.length,
    item: (i: number) => files[i] ?? null,
    [Symbol.iterator]: function* () {
      for (let i = 0; i < files.length; i++) {
        yield files[i];
      }
    },
  };
  for (let i = 0; i < files.length; i++) {
    (list as Record<number, File>)[i] = files[i];
  }
  return list as FileList;
}

describe('useIngestDropZone', () => {
  const validFile = new File(['content'], 'test.txt', { type: 'text/plain' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns dragOver false and exposes handlers', async () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useIngestDropZone({ vectorStoreId: 'vs-1' }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      expect(result.current.dragOver).toBe(false);
      expect(result.current.uploading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.onFileUpload).toBe('function');
      expect(typeof result.current.onDragOver).toBe('function');
      expect(typeof result.current.onDragLeave).toBe('function');
      expect(typeof result.current.onDrop).toBe('function');
      expect(typeof result.current.onClearError).toBe('function');
      expect(result.current.fileInputRef).toBeDefined();
    });
  });

  describe('drag state', () => {
    it('sets dragOver true on onDragOver', () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useIngestDropZone({ vectorStoreId: null }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      act(() => {
        result.current.onDragOver({
          preventDefault: jest.fn(),
        } as unknown as React.DragEvent<HTMLDivElement>);
      });

      expect(result.current.dragOver).toBe(true);
    });

    it('sets dragOver false on onDragLeave', () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useIngestDropZone({ vectorStoreId: null }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      act(() => {
        result.current.onDragOver({
          preventDefault: jest.fn(),
        } as unknown as React.DragEvent<HTMLDivElement>);
      });
      expect(result.current.dragOver).toBe(true);

      act(() => {
        result.current.onDragLeave();
      });
      expect(result.current.dragOver).toBe(false);
    });

    it('sets dragOver false on onDrop', async () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useIngestDropZone({ vectorStoreId: 'vs-1' }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      act(() => {
        result.current.onDragOver({
          preventDefault: jest.fn(),
        } as unknown as React.DragEvent<HTMLDivElement>);
      });

      await act(async () => {
        result.current.onDrop({
          preventDefault: jest.fn(),
          dataTransfer: { files: createFileList([validFile]) },
        } as unknown as React.DragEvent<HTMLDivElement>);
      });

      expect(result.current.dragOver).toBe(false);
    });
  });

  describe('file upload', () => {
    it('uploads files and calls onUploadComplete on success', async () => {
      const onUploadComplete = jest.fn();
      const mockApi = createMockApi();
      const { result } = renderHook(
        () =>
          useIngestDropZone({
            vectorStoreId: 'vs-1',
            onUploadComplete,
          }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.onFileUpload(createFileList([validFile]));
      });

      expect(mockApi.uploadDocument).toHaveBeenCalledWith(
        validFile,
        'vs-1',
        undefined,
      );
      expect(onUploadComplete).toHaveBeenCalledWith(
        '1 file ingested successfully.',
      );
    });

    it('uses singular message for one file, plural for multiple', async () => {
      const onUploadComplete = jest.fn();
      const mockApi = createMockApi();
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      const { result } = renderHook(
        () =>
          useIngestDropZone({
            vectorStoreId: 'vs-1',
            onUploadComplete,
          }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.onFileUpload(createFileList([validFile, file2]));
      });

      expect(onUploadComplete).toHaveBeenCalledWith(
        '2 files ingested successfully.',
      );
    });

    it('passes vectorStoreId undefined when null', async () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useIngestDropZone({ vectorStoreId: null }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.onFileUpload(createFileList([validFile]));
      });

      expect(mockApi.uploadDocument).toHaveBeenCalledWith(
        validFile,
        undefined,
        undefined,
      );
    });

    it('does nothing when files is null or empty', async () => {
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useIngestDropZone({ vectorStoreId: 'vs-1' }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.onFileUpload(null);
      });
      expect(mockApi.uploadDocument).not.toHaveBeenCalled();

      await act(async () => {
        await result.current.onFileUpload(createFileList([]));
      });
      expect(mockApi.uploadDocument).not.toHaveBeenCalled();
    });

    it('does not call onUploadComplete when no uploads succeed', async () => {
      const onUploadComplete = jest.fn();
      const mockApi = createMockApi({
        uploadDocument: jest.fn().mockRejectedValue(new Error('Upload failed')),
      });
      const { result } = renderHook(
        () =>
          useIngestDropZone({
            vectorStoreId: 'vs-1',
            onUploadComplete,
          }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        await result.current.onFileUpload(createFileList([validFile]));
      });

      expect(onUploadComplete).not.toHaveBeenCalled();
    });
  });

  describe('onDrop', () => {
    it('calls preventDefault and uploads dataTransfer.files', async () => {
      const preventDefault = jest.fn();
      const mockApi = createMockApi();
      const { result } = renderHook(
        () => useIngestDropZone({ vectorStoreId: 'vs-1' }),
        { wrapper: createApiTestWrapper(mockApi) },
      );

      await act(async () => {
        result.current.onDrop({
          preventDefault,
          dataTransfer: { files: createFileList([validFile]) },
        } as unknown as React.DragEvent<HTMLDivElement>);
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(mockApi.uploadDocument).toHaveBeenCalled();
    });
  });
});
