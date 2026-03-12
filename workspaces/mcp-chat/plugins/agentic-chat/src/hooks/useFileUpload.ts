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
import { useState, useCallback, useRef, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import type { UploadResult } from '../types';

const ALLOWED_EXTENSIONS = new Set([
  '.md',
  '.txt',
  '.pdf',
  '.json',
  '.yaml',
  '.yml',
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Hook for uploading documents to the knowledge base.
 * Provides client-side validation and upload state management.
 */
export function useFileUpload() {
  const api = useApi(agenticChatApiRef);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return `Unsupported file type: ${ext}. Allowed: ${[
        ...ALLOWED_EXTENSIONS,
      ].join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(
        1,
      )}MB). Maximum: 10MB`;
    }
    return null;
  }, []);

  const upload = useCallback(
    async (
      file: File,
      vectorStoreId?: string,
      replace?: boolean,
    ): Promise<UploadResult> => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        throw new Error(validationError);
      }

      try {
        setUploading(true);
        setError(null);
        const uploadResult = await api.uploadDocument(
          file,
          vectorStoreId,
          replace,
        );
        if (mountedRef.current) {
          setResult(uploadResult);
        }
        return uploadResult;
      } catch (err: unknown) {
        let msg = 'Upload failed';
        if (err instanceof Error) {
          // ResponseError from Backstage includes the response body
          if (err.message.includes('already exists')) {
            msg = `A file named "${file.name}" already exists in this vector store. Delete it first or upload with a different name.`;
          } else {
            msg = err.message;
          }
        }
        if (mountedRef.current) {
          setError(msg);
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setUploading(false);
        }
      }
    },
    [api, validateFile],
  );

  const clearError = useCallback(() => setError(null), []);
  const clearResult = useCallback(() => setResult(null), []);

  return {
    upload,
    uploading,
    error,
    result,
    validateFile,
    clearError,
    clearResult,
  };
}
