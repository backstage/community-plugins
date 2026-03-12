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
import { useState, useCallback, useRef, type DragEvent } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';

export interface UseIngestDropZoneParams {
  vectorStoreId: string | null;
  onUploadComplete?: (message: string) => void;
}

export function useIngestDropZone({
  vectorStoreId,
  onUploadComplete,
}: UseIngestDropZoneParams) {
  const {
    upload,
    uploading,
    error: uploadError,
    clearError: clearUploadError,
  } = useFileUpload();

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      clearUploadError();
      let succeeded = 0;
      for (let i = 0; i < files.length; i++) {
        const ok = await upload(files[i], vectorStoreId ?? undefined).then(
          () => true,
          () => false,
        );
        if (ok) succeeded++;
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (succeeded > 0) {
        const message = `${succeeded} file${
          succeeded !== 1 ? 's' : ''
        } ingested successfully.`;
        onUploadComplete?.(message);
      }
    },
    [upload, clearUploadError, vectorStoreId, onUploadComplete],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  return {
    onFileUpload: handleFileUpload,
    uploading,
    error: uploadError,
    onClearError: clearUploadError,
    dragOver,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    fileInputRef,
  };
}
