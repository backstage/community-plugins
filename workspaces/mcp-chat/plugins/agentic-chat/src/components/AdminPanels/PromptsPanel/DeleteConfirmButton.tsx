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
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';

export interface DeleteConfirmButtonProps {
  readonly confirmLabel: string;
  readonly tooltipTitle?: string;
  readonly onConfirm: () => void;
}

const AUTO_DISMISS_MS = 3000;

const CONFIRM_SX = { textTransform: 'none', whiteSpace: 'nowrap' } as const;

export const DeleteConfirmButton: React.FC<DeleteConfirmButtonProps> = ({
  confirmLabel,
  tooltipTitle = 'Delete',
  onConfirm,
}) => {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleFirstClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(true);
    timerRef.current = setTimeout(() => setConfirming(false), AUTO_DISMISS_MS);
  }, []);

  const handleConfirm = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (timerRef.current) clearTimeout(timerRef.current);
      setConfirming(false);
      onConfirm();
    },
    [onConfirm],
  );

  if (confirming) {
    return (
      <Button
        size="small"
        color="error"
        variant="outlined"
        onClick={handleConfirm}
        sx={CONFIRM_SX}
      >
        {confirmLabel}
      </Button>
    );
  }

  return (
    <Tooltip title={tooltipTitle}>
      <IconButton
        size="small"
        onClick={handleFirstClick}
        aria-label={tooltipTitle}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
