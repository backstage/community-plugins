import { makeStyles } from '@material-ui/core/styles';

/** @public */
export type ComboBoxClassKey = 'input';

export const useComboBoxStyles = makeStyles(
  {
    root: {},
    label: {},
    input: {},
    fullWidth: { width: '100%' },
    boxLabel: {
      width: '100%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  },
  {
    name: 'ComboBox',
  },
);
