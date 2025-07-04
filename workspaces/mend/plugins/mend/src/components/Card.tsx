import type { ReactNode } from 'react';
import {
  Card as Containter,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  makeStyles,
} from '@material-ui/core';

type CardProps = {
  children: ReactNode;
  loading?: boolean;
  title: string;
};

const useStyles = makeStyles(() => ({
  container: {
    border: '1px solid #dfdfdf',
    height: '100%',
    minHeight: 168,
  },
  header: {
    justifyContent: 'center',
    padding: '16px',
    '& span': {
      fontWeight: 500,
      fontSize: '20px',
    },
  },
  content: {
    alignItems: 'center',
    justifyContent: 'space-around',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const Card = ({ children, loading, title }: CardProps): ReactNode => {
  const classes = useStyles();

  return (
    <Containter className={classes.container}>
      <CardHeader className={classes.header} title={title} />
      <Divider />
      <CardContent className={classes.content}>
        {loading ? <CircularProgress /> : children}
      </CardContent>
    </Containter>
  );
};
