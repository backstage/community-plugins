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
import { Tag } from '@backstage-community/plugin-announcements-common';
import { useCallback, useState } from 'react';

type DeleteTagDialogState = {
  open: (t: Tag) => void;
  close: () => void;

  isOpen: boolean;
  tag?: Tag;
};

export function useDeleteTagDialogState(): DeleteTagDialogState {
  const [state, setState] = useState<{
    open: boolean;
    tag?: Tag;
  }>({ open: false });

  const setOpen = useCallback(
    (t: Tag) => {
      setState({
        open: true,
        tag: t,
      });
    },
    [setState],
  );

  const setClosed = useCallback(() => {
    setState({
      open: false,
      tag: undefined,
    });
  }, [setState]);

  return {
    open: setOpen,
    close: setClosed,

    tag: state.tag,
    isOpen: state.open,
  };
}
