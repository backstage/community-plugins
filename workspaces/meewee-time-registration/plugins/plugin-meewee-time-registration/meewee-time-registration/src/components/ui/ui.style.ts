import { makeStyles } from '@material-ui/core';
import { Theme } from '@mui/material/styles';

export const useCustomHeaderStyles = makeStyles(() => ({
  '@font-face': {
    fontFamily: 'InterFont',
    src: `url('../../assets/fonts/Inter/Inter-Regular.ttf') format('truetype')`,
  },
  organizationPickerContainer: {
    display: 'flex',
    alignItems: 'center',
    height: '20px',
    width: '170px',
    marginRight: '30px',
  },
  root: {
    fontFamily: 'InterFont',
  },
  container: {
    width: '100%',
    position: 'relative',
    fontFamily: 'InterFont, sans-serif !important',
    '& >div': {
      boxShadow: 'none',
    },
  },
  registerBtn: {
    color: 'white',
    backgroundColor: '#219DB6',
    position: 'absolute',
    right: '20px',
    '&:hover': {
      backgroundColor: '#08697c',
    },
  },
  headerDate: {
    fontFamily: 'InterFont, sans-serif !important',
  },
  headerDateArrow: {
    padding: '0 15px',
  },
}));

export const useRegistrationModalStyles = makeStyles((theme: Theme) => ({
  '& input': {
    padding: '10px',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
    '& svg': {
      color: '#fff',
    },
  },
  registerBtn: {
    color: 'white',
    backgroundColor: '#219DB6',
    position: 'absolute',
    right: '20px',
    '&:hover': {
      backgroundColor: '#08697c',
    },
  },
  dialogTitle: {
    backgroundColor: '#666666',
    color: '#fff',
    fontWeight: 'normal',
    '& h2': {
      fontWeight: '100',
    },
  },
  dialogContent: {
    margin: '20px 0',
  },
  dialogActions: {
    padding: '0 25px 30px 0',
    '& button': {
      backgroundColor: '#219DB6',
    },
    '& button:hover': {
      backgroundColor: '#08697c',
    },
  },
}));

export const useRegistrationTableStyles = makeStyles(theme => ({
  container: {
    width: '100%',
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  empty_register: {
    padding: '0',
    textTransform: 'initial',
    lineHeight: 'normal',
    color: '#219DB6',
    transition: 'all 2s ease',
    '&:hover': {
      backgroundColor: 'unset',
      textDecoration: 'underline',
    },
  },
  table_title: {
    color: '#8F8F8F',
    fontSize: '14px',
    fontWeight: 'normal',
    width: '100%',
    display: 'flex',
  },
  table_count: {
    color: '#219DB6',
    fontWeight: 'bold',
  },
  table_total: {
    position: 'absolute',
    right: '25px',
  },
  table: {
    '& th': {
      textTransform: 'capitalize',
      borderTop: 'none',
    },
    '& td': {
      padding: '15px',
      fontWeight: 'normal !important',
    },
    '&>div>div>div:nth-child(2)': {
      border: '1px solid #c6c6c694',
      margin: '0 14px 14px',
      borderRadius: '7px',
      maxHeight: '350px',
    },
  },
}));

export const useLoginModalStyles = makeStyles({
  loginGrid: {
    padding: '0 9.4em',
    fontSize: '16px',
  },
  loginField: {
    width: '250px',
    '& label': {
      fontSize: '18px',
    },
  },
  loginWrapper: {
    position: 'relative',
  },
  loginTitle: {
    textAlign: 'center',

    padding: '50px',
    '& h2': {
      fontSize: '29px',
    },
    '& img': {
      verticalAlign: 'middle',
    },
  },
  loginClose: {
    position: 'absolute',
    right: '34px',
    top: '20px',
  },
  dialogTitle: {
    color: 'red',
  },

  dialogActions: {
    display: ' block',
    padding: '4em',
    left: '0',
    right: '0',
    position: 'relative',
    textAlign: 'center',
  },
  signUpLink: {
    color: '#219DB6',
  },
  signinBtn: {
    backgroundColor: '#219DB6',
    fontSize: '18px',
    textTransform: 'capitalize',
    padding: ' 6px 100px',
    '&:hover': {
      backgroundColor: '#08697c',
    },
  },
  footerText: { paddingTop: '3em' },
  passwordErrorText: {
    display: 'flex',
    marginTop: '10px',
  },
});
