import { Category } from '@backstage-community/plugin-announcements-common';
import { useCallback, useState } from 'react';

export type DeleteCategoryDialogState = {
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
