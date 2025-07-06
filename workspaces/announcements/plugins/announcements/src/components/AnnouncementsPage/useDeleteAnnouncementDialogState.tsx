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
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { useCallback, useState } from 'react';

type DeleteAnnouncementDialogState = {
  open: (a: Announcement) => void;
  close: () => void;

  isOpen: boolean;
  announcement?: Announcement;
};

export function useDeleteAnnouncementDialogState(): DeleteAnnouncementDialogState {
  const [state, setState] = useState<{
    open: boolean;
    announcement?: Announcement;
  }>({ open: false });

  const setOpen = useCallback(
    (a: Announcement) => {
      setState({
        open: true,
        announcement: a,
      });
    },
    [setState],
  );

  const setClosed = useCallback(() => {
    setState({
      open: false,
      announcement: undefined,
    });
  }, [setState]);

  return {
    open: setOpen,
    close: setClosed,

    announcement: state.announcement,
    isOpen: state.open,
  };
}
