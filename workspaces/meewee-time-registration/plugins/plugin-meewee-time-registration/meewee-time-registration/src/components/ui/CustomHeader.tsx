import React, { useState } from 'react';
import { Typography, Button, Box, MenuItem } from '@material-ui/core';
import { InfoCard } from '@backstage/core-components';
import IconButton from '@material-ui/core/IconButton';
import PrevIcon from '@material-ui/icons/NavigateBefore';
import NextIcon from '@material-ui/icons/NavigateNext';
import logo from '../../assets/images/meewee-initials.svg';
import { CustomHeaderProps } from '../../types/components/customHeader';
import { useCustomHeaderStyles } from './ui.style';
import { Select } from '@mui/material';
import LoginModal from './LoginModal';

const CustomHeader: React.FC<CustomHeaderProps> = ({
  authToken,
  selectedDate,
  organizationList,
  selectedOrgId,
  cbSetRegistrationModalState,
  cbChangeDay,
  cbHandleOrgClickChange,
  cbStoreTokenLogin,
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const classes = useCustomHeaderStyles();

  return (
    <div className={classes.container}>
      <InfoCard
        noPadding
        title={
          <Box display="flex" alignItems="center">
            <img src={logo} alt="logo" width="55px" />
            <div className={classes.organizationPickerContainer}>
              <Select
                style={{ borderRadius: '11px' }}
                value={selectedOrgId || 0}
                onChange={cbHandleOrgClickChange}
                placeholder="e.g. 7, 5"
                inputProps={{ 'aria-label': 'Without label' }}
                sx={{
                  boxShadow: 'none',
                  '.MuiOutlinedInput-notchedOutline': { border: 0 },
                  '&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline':
                    {
                      border: 0,
                    },
                  '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      border: 0,
                    },
                }}
              >
                {organizationList?.map((organization, index) => (
                  <MenuItem key={index} value={organization.orgId}>
                    <Typography className={classes.headerDate} variant="h6">
                      {organization?.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </div>
            <Typography className={classes.headerDate} variant="h6">
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
            >
              {authToken ? 'Register' : 'Login'}
            </Button>
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
