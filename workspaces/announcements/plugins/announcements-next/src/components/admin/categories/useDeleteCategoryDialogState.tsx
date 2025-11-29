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
import { Category } from '@backstage-community/plugin-announcements-common';
import { useCallback, useState } from 'react';

type DeleteCategoryDialogState = {
  open: (c: Category) => void;
  close: () => void;

  isOpen: boolean;
  category?: Category;
};

export function useDeleteCategoryDialogState(): DeleteCategoryDialogState {
  const [state, setState] = useState<{
    open: boolean;
    category?: Category;
  }>({ open: false });

  const setOpen = useCallback(
    (c: Category) => {
      setState({
        open: true,
        category: c,
      });
    },
    [setState],
  );

  const setClosed = useCallback(() => {
    setState({
      open: false,
      category: undefined,
    });
  }, [setState]);

  return {
    open: setOpen,
    close: setClosed,

    category: state.category,
    isOpen: state.open,
  };
}
