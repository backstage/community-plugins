import Typography from '@mui/material/Typography';
import SvgIcon from '@mui/material/SvgIcon';
import { makeStyles } from '@mui/styles';
import { tableIconMap, TableIcon } from './table.icons';

type TableMessageProps = {
  icon: TableIcon;
  message: string;
  title: string;
};

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    flexDirection: 'column',
    gap: '16px',
    padding: '100px 0',
  },
  icon: {
    backgroundColor: '#DBE8F8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50px',
    width: '40px',
    height: '40px',
  },
}));

export const TableMessage = ({ icon, message, title }: TableMessageProps) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.icon}>
        <SvgIcon viewBox="-4 -3 24 24">{tableIconMap[icon]}</SvgIcon>
      </div>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1">{message}</Typography>
    </div>
  );
};
