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

import { Box, ButtonIcon } from '@backstage/ui';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PreviewIcon from '@material-ui/icons/Visibility';

type TableActionsProps<T> = {
  rowData: T;
  onTitleClick: (rowData: T) => void;
  onEdit: (rowData: T) => void;
  onDelete: (rowData: T) => void;
  isLoading: boolean;
  isDisabled: boolean;
};

export const TableActions = <T,>(props: TableActionsProps<T>) => {
  const { rowData, onTitleClick, onEdit, onDelete, isLoading, isDisabled } =
    props;

  const disabled = isLoading || isDisabled;

  return (
    <Box display="flex">
      <ButtonIcon
        aria-label="preview"
        icon={<PreviewIcon fontSize="small" data-testid="preview-icon" />}
        size="small"
        variant="tertiary"
        isDisabled={disabled}
        onClick={() => onTitleClick(rowData)}
      />
      <ButtonIcon
        aria-label="edit"
        icon={<EditIcon fontSize="small" data-testid="edit-icon" />}
        size="small"
        variant="tertiary"
        onClick={() => onEdit(rowData)}
        isDisabled={disabled}
      />
      <ButtonIcon
        aria-label="delete"
        icon={<DeleteIcon fontSize="small" data-testid="delete-icon" />}
        size="small"
        variant="tertiary"
        onClick={() => onDelete(rowData)}
        isDisabled={disabled}
      />
    </Box>
  );
};
