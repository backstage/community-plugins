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
import { useCallback, useState } from 'react';

type DeleteDialogState<T> = {
  open: (item: T) => void;
  close: () => void;
  isOpen: boolean;
  item?: T;
};

export function useDeleteDialogState<T>(): DeleteDialogState<T> {
  const [state, setState] = useState<{
    open: boolean;
    item?: T;
  }>({ open: false });

  const setOpen = useCallback(
    (item: T) => {
      setState({
        open: true,
        item,
      });
    },
    [setState],
  );

  const setClosed = useCallback(() => {
    setState({
      open: false,
      item: undefined,
    });
  }, [setState]);

  return {
    open: setOpen,
    close: setClosed,
    item: state.item,
    isOpen: state.open,
  };
}
