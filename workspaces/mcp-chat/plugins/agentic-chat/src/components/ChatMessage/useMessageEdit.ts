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

import { useState, useEffect } from 'react';

export interface UseMessageEditReturn {
  isEditing: boolean;
  editText: string;
  handleStartEdit: () => void;
  handleCancelEdit: () => void;
  handleSubmitEdit: () => void;
  handleEditKeyDown: (e: React.KeyboardEvent) => void;
  setEditText: (value: string) => void;
}

export function useMessageEdit(
  messageId: string,
  messageText: string,
  onEditMessage?: (messageId: string, newText: string) => void,
): UseMessageEditReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(messageText);

  useEffect(() => {
    setEditText(messageText);
  }, [messageText]);

  const handleStartEdit = () => {
    setEditText(messageText);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(messageText);
  };

  const handleSubmitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== messageText && onEditMessage) {
      onEditMessage(messageId, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return {
    isEditing,
    editText,
    handleStartEdit,
    handleCancelEdit,
    handleSubmitEdit,
    handleEditKeyDown,
    setEditText,
  };
}
