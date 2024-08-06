import { makeStyles } from '@material-ui/core';
import { Theme } from '@mui/material/styles';

export const useCustomHeaderStyles = makeStyles({
  organizationPickerContainer: {
    display: 'flex',
    alignItems: 'center',
    height: '20px',
    width: '170px',
    marginRight: '30px',
  },

  container: {
    width: '100%',
    position: 'relative',
    '& >div': {
      boxShadow: 'none',
    },
  },
  registerBtn: {
    position: 'absolute',
    right: '20px',
  },

  headerDateArrow: {
    padding: '0 15px',
  },

  orgSelect: {
    boxShadow: 'none',
    '.MuiOutlinedInput-notchedOutline': { border: 0 },
    '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      border: 0,
    },
    '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 0,
    },
  },
});

export const useRegistrationModalStyles = makeStyles((theme: Theme) => ({
  '& input': {
    padding: '10px',
  },

  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  registerBtn: {
    position: 'absolute',
    right: '20px',
  },
  dialogTitle: {
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

    transition: 'all 2s ease',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  table_title: {
    fontSize: '14px',
    fontWeight: 'normal',
    width: '100%',
    display: 'flex',
  },
  table_count: {
    fontWeight: 'bold',
  },
  table_total: {
    position: 'absolute',
    right: '25px',
  },
  table: {
    '& th': {
      textTransform: 'capitalize',
    },
    '& td': {
      padding: '15px',
      fontWeight: 'normal !important',
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

  dialogActions: {
    display: ' block',
    padding: '4em',
    left: '0',
    right: '0',
    position: 'relative',
    textAlign: 'center',
  },

  signinBtn: {
    fontSize: '18px',
    textTransform: 'capitalize',
    padding: ' 6px 100px',
  },
  footerText: { paddingTop: '3em' },
  passwordErrorText: {
    display: 'flex',
    marginTop: '10px',
  },
});
