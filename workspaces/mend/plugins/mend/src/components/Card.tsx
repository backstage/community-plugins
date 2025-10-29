import type { ReactNode } from 'react';
import Container from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';

import { makeStyles } from '@mui/styles';

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
    <Container className={classes.container}>
      <CardHeader className={classes.header} title={title} />
      <Divider />
      <CardContent className={classes.content}>
        {loading ? <CircularProgress /> : children}
      </CardContent>
    </Container>
  );
};
