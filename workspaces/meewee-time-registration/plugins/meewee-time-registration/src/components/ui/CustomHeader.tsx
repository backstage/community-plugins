import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Box,
  MenuItem,
  Menu,
  Select,
} from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import IconButton from '@material-ui/core/IconButton';
import PrevIcon from '@material-ui/icons/NavigateBefore';
import NextIcon from '@material-ui/icons/NavigateNext';
import logo from '../../assets/images/meewee-initials.svg';
import { CustomHeaderProps } from '../../types/components/customHeader';
import { useCustomHeaderStyles } from './ui.style';

import LoginModal from './LoginModal';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LinkOff } from '@material-ui/icons';

const CustomHeader = ({
  authToken,
  selectedDate,
  organizationList,
  selectedOrgId,
  cbSetRegistrationModalState,
  cbChangeDay,
  cbHandleOrgClickChange,
  cbStoreTokenLogin,
  removeAuthTokenLogout,
}: CustomHeaderProps) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const classes = useCustomHeaderStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!authToken) {
      handleClose();
    }
  }, [authToken]);

  return (
    <div className={classes.container}>
      <InfoCard
        noPadding
        title={
          <Box display="flex" alignItems="center">
            <img
              src={logo}
              alt="logo"
              width="55px"
              style={{ marginRight: '24px' }}
            />
            <div className={classes.organizationPickerContainer}>
              <Select
                style={{ borderRadius: '11px' }}
                value={selectedOrgId || 0}
                onChange={cbHandleOrgClickChange}
                placeholder="e.g. 7, 5"
                inputProps={{ 'aria-label': 'Without label' }}
              >
                {organizationList?.map((organization, index) => (
                  <MenuItem key={index} value={organization.orgId}>
                    <Typography variant="h6">{organization?.name}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </div>
            <Typography variant="h6">
              {selectedDate?.toLocaleString({
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
            <div className={classes.headerDateArrow}>
              <IconButton onClick={() => cbChangeDay(-1)} size="small">
                <PrevIcon />
              </IconButton>
              <IconButton onClick={() => cbChangeDay(1)} size="small">
                <NextIcon />
              </IconButton>
            </div>

            <Button
              className={classes.registerBtn}
              color="primary"
              variant="contained"
              onClick={() =>
                authToken
                  ? cbSetRegistrationModalState(true)
                  : setIsLoginModalOpen(true)
              }
              style={{ right: authToken ? '50px' : '20px' }}
            >
              {authToken ? 'Register' : 'Login'}
            </Button>
            {authToken && (
              <>
                <IconButton
                  aria-label="more"
                  id="long-button"
                  aria-controls={open ? 'long-menu' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-haspopup="true"
                  onClick={handleClick}
                  style={{ position: 'absolute', right: 0 }}
                >
                  <MoreVertIcon />
                </IconButton>

                <Menu
                  id="unlink-account"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  getContentAnchorEl={null}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => removeAuthTokenLogout()}>
                    <LinkOff style={{ marginRight: '8px' }} />
                    Unlink account
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        }
      ></InfoCard>
      <LoginModal
        isLoginModalOpen={isLoginModalOpen}
        cbCloseModal={() => setIsLoginModalOpen(false)}
        cbStoreTokenLogin={cbStoreTokenLogin}
      />
    </div>
  );
};

export default CustomHeader;
