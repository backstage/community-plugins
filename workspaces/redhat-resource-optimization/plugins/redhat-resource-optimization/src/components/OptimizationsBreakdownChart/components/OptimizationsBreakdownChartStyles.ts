import { makeStyles } from '@material-ui/core/styles';

export const useOptimizationsBreakdownChartStyles = makeStyles(() => ({
  chartOverride: {
    '& > div > div > svg': {
      overflow: 'visible',
    },
  },
}));
