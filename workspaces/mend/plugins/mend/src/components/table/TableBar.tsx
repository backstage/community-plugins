import { Typography, makeStyles } from '@material-ui/core';
import { numberToShortText } from '../../utils';

type TableBarProps = {
  active?: number;
  title: string;
  total?: number | boolean;
};

const useStyles = makeStyles(() => ({
  toolbar: {
    width: 'max-content',
    padding: '12px 20px',
    '& h5': {
      fontWeight: 500,
      fontSize: '20px',
    },
  },
}));

export const TableBar = ({ active, title, total }: TableBarProps) => {
  const classes = useStyles();
  return (
    <div className={classes.toolbar}>
      <Typography variant="h5">
        {title} ({numberToShortText(active)}
        {!!total && (
          <Typography component="span" variant="body1">
            {` / ${numberToShortText(total as number)}`}
          </Typography>
        )}
        )
      </Typography>
    </div>
  );
};
