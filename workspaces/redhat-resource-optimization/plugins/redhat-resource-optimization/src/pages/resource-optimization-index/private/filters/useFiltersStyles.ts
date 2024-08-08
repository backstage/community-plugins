import { makeStyles } from '@material-ui/core/styles';

/** @public */
export type TableFiltersClassKey = 'root' | 'value' | 'heder' | 'filters';
export const useFiltersStyles = makeStyles(
  theme => ({
    root: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      marginRight: theme.spacing(3),
    },
    value: {
      fontWeight: 'bold',
      fontSize: 18,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      height: theme.spacing(7.5),
      justifyContent: 'space-between',
      borderBottom: `1px solid ${theme.palette.grey[500]}`,
    },
    filters: {
      display: 'flex',
      flexDirection: 'column',
      '& > *': {
        marginTop: theme.spacing(2),
      },
    },
  }),
  { name: 'BackstageTableFilters' },
);
