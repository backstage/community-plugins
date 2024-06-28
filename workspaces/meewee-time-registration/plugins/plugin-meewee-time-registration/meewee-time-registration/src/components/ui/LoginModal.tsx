import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Link,
  Typography,
} from '@material-ui/core';
import { Close, Error } from '@material-ui/icons';
import { TextField } from '@mui/material';
import { useLoginModalStyles } from '../ui/ui.style';
import MeeweeLogo from '../../assets/images/meewee-lettermark-logo.svg';
import { useApi } from '../../request/useApi';
import { LoginModalProps } from '../../types/components/loginModal';

const LoginModal: React.FC<LoginModalProps> = ({
  isLoginModalOpen,
  cbCloseModal,
  cbStoreTokenLogin,
}) => {
  const classes = useLoginModalStyles();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    return true;
  };

  const clearLoginData = () => {
    setEmail('');
    setPassword('');
    setEmailError('');
    setPasswordError('');
    setLoginError('');
  };

  const handleModalClose = () => {
    cbCloseModal();
    clearLoginData();
  };

  const login = async () => {
    if (validateEmail() && validatePassword()) {
      const loginParams = {
        username: email,
        password: password,
        otp: '',
      };

      try {
        const response = await useApi('fetchAuthToken', loginParams);

        if (response) {
          // Successful login
          cbStoreTokenLogin(email, response);
          handleModalClose();
        } else {
          // Incorrect email or password
          setLoginError('Email/Password is incorrect');
        }
      } catch (error) {
        // API call failed or other error
        setLoginError('Login error. Please try again.');
      }
    }
  };

  const dialogContent = () => {
    return (
      <>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          className={classes.loginGrid}
        >
          <Grid item xs={12}>
            <TextField
              className={classes.loginField}
              value={email}
              onChange={handleEmailChange}
              id="email"
              label="Email"
              variant="standard"
              error={!!emailError}
              helperText={emailError}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              className={classes.loginField}
              value={password}
              onChange={handlePasswordChange}
              id="password"
              label="Password"
              variant="standard"
              type="password"
              error={!!passwordError}
              helperText={passwordError}
            />
          </Grid>
          <Grid item xs={12}>
            {loginError && (
              <Typography
                variant="body2"
                color="error"
                className={classes.passwordErrorText}
              >
                <Error fontSize="small" style={{ marginRight: '4px' }} />
                {loginError}
              </Typography>
            )}
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <>
      <Dialog
        className={classes.loginWrapper}
        open={isLoginModalOpen}
        onClose={handleModalClose}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle
          style={{ width: '600px' }}
          className={classes.loginTitle}
          id="dialog-title"
        >
          Sign in to <img src={MeeweeLogo} alt="Logo" width={120} />
          <IconButton
            className={classes.loginClose}
            aria-label="close"
            onClick={handleModalClose} // Handle close directly here
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>{dialogContent()}</DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            className={classes.signinBtn}
            color="primary"
            variant="contained"
            onClick={() => {
              void login();
            }}
          >
            Sign in
          </Button>
          <Typography className={classes.footerText}>
            {' '}
            Don't have an account?{' '}
            <Link
              className={classes.signUpLink}
              underline="hover"
              href="https://nxt.staging.meewee.com/signup"
              target="_blank"
            >
              Sign up now!
            </Link>
          </Typography>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginModal;
