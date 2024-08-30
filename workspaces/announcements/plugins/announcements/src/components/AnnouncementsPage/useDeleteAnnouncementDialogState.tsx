import { Announcement } from '@procore-oss/backstage-plugin-announcements-common';
import { useCallback, useState } from 'react';

export type DeleteAnnouncementDialogState = {
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
