import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core';
import { DateTime } from 'luxon';
import { useStyles } from './MainComponent.style';
import {
  AddTaskInfoThenAddRegistrationInfoParam,
  ProjectMeta,
  RegistrationData,
  RegistrationMeta,
} from '../../types/request/timeRegistration';
import CustomHeader from '../ui/CustomHeader';
import RegistrationTable from '../ui/RegistrationTable';
import { AuthProvider } from '../../context/AuthContext';
import { useAuth } from '../../context/useAuth';
import { useApi } from '../../request/useApi';
import { MappedOrgList } from '../../types/request/transitResponseBuilder/userProfileResponseBuilder';
import { SelectChangeEvent } from '@mui/material';

const MainComponent: React.FC = () => {
  const { state, dispatch } = useAuth();
  const { token } = state;
  const classes = useStyles();
  const [userId, setUserId] = useState<number | undefined>();
  const [registrations, setRegistrations] = useState<RegistrationMeta[] | []>(
    [],
  );
  const [registrationsTotalTime, setRegistrationsTotalTime] =
    useState<string>();
  const [overallProjects, setOverallProjects] = useState<ProjectMeta[] | []>(
    [],
  );
  const [employmentId, setEmploymentId] = useState<number | undefined>();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] =
    useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState(DateTime.now());
  const [shouldRecallRegistrations, setShouldRecallRegistrations] =
    useState<boolean>(false);
  const [organizationList, setOrganizationList] = useState<MappedOrgList[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(
    undefined,
  );

  const changeDay = (offset = 1) => {
    setSelectedDate(prev => prev.plus({ day: offset }));
  };

  const storeTokenLogin = (userName: string, token: string) => {
    dispatch({ type: 'LOGIN', payload: { userName, token } });
  };

  // const removeAuthTokenLogout = () => {
  //   dispatch({ type: 'LOGOUT' });
  // };

  const getRegistrations = (employmentId: number | undefined) => {
    if (employmentId && token) {
      useApi('fetchRegistrations', {
        date: selectedDate.toFormat('yyyy-MM-dd'),
        authToken: token,
        employmentId,
      })
        .then(overallProjectsAndProjWithReg => {
          const {
            overall,
            projectWithRegistration,
            overallRegistrationsTotalTime,
          } = overallProjectsAndProjWithReg;
          setRegistrations(projectWithRegistration);
          setRegistrationsTotalTime(overallRegistrationsTotalTime);
          setOverallProjects(overall);
        })
        .catch(error => {
          // Handle error here
          console.error(error);
        });
    }
  };

  const postRegistration = (registration: RegistrationData) => {
    if (token && userId) {
      useApi('addRegistrationInfo', {
        authToken: token,
        addRegistrationInfoParam: {
          registrationData: registration,
          userId: userId,
        },
      })
        .then(() => setShouldRecallRegistrations(true))
        .catch(error => {
          // Handle error here
          console.error(error);
        });
    }
  };

  const postTaskThenPostRegistration = (
    addTaskInfoThenAddRegistrationParam: AddTaskInfoThenAddRegistrationInfoParam,
  ) => {
    if (token && userId) {
      useApi('addTaskInfoThenAddRegistrationInfo', {
        authToken: token,
        addTaskInfoThenAddRegistrationInfo: addTaskInfoThenAddRegistrationParam,
        userId,
      })
        .then(() => setShouldRecallRegistrations(true))
        .catch(error => {
          // Handle error here
          console.error(error);
        });
    }
  };

  useEffect(() => {
    if (shouldRecallRegistrations) {
      getRegistrations(employmentId);
      setShouldRecallRegistrations(false);
    }
  }, [shouldRecallRegistrations]);

  useEffect(() => {
    setShouldRecallRegistrations(true);
  }, [selectedDate]);

  useEffect(() => {
    if (token) {
      useApi('fetchUserProfile', { authToken: token })
        .then(response => {
          const { employments, userId, mappedOrgList } = response;
          setUserId(userId);
          const firstOrgEmploymentId = employments?.[0]?.id;
          setOrganizationList(mappedOrgList || []);
          setSelectedOrgId(0);
          setEmploymentId(firstOrgEmploymentId);
          getRegistrations(firstOrgEmploymentId);
        })
        .catch(error => {
          // Handle error here
          console.error(error);
        });
    } else {
      setUserId(undefined);
      setEmploymentId(undefined);
      setRegistrations([]);
      setRegistrationsTotalTime(undefined);
      setOverallProjects([]);
      setSelectedOrgId(undefined);
      setOrganizationList([]);
    }
  }, [token]);

  useEffect(() => {
    setSelectedOrgId(organizationList?.[0]?.orgId || undefined);
  }, [organizationList]);

  const handleOrgClickChange = (event: SelectChangeEvent<number>) => {
    const orgId = event?.target?.value || 0;
    setSelectedOrgId(+orgId);
  };

  const filteredRegistrationByOrgId = registrations?.filter(registration => {
    if (selectedOrgId === 0) {
      return registration;
    } else {
      return registration.projectId === selectedOrgId;
    }
  });

  return (
    <AuthProvider>
      <Grid container className="main" spacing={3} direction="column">
        {/* <Button
          className={classes.registerBtn}
          color="primary"
          variant="contained"
          onClick={() => removeAuthTokenLogout()}
        >
          LOGOUT
        </Button> */}
        <Grid item>
          <div className={classes.gridWrapper}>
            <CustomHeader
              cbSetRegistrationModalState={setIsRegistrationModalOpen}
              authToken={token || ''}
              cbChangeDay={changeDay}
              selectedDate={selectedDate}
              organizationList={organizationList}
              selectedOrgId={selectedOrgId}
              cbStoreTokenLogin={storeTokenLogin}
              cbHandleOrgClickChange={handleOrgClickChange}
            />
            <RegistrationTable
              cbSetModalState={setIsRegistrationModalOpen}
              authToken={token || ''}
              isModalOpen={isRegistrationModalOpen}
              registrations={filteredRegistrationByOrgId}
              overallProjects={overallProjects}
              registrationsTotalTime={registrationsTotalTime}
              employmentId={employmentId}
              cbPostRegistration={postRegistration}
              cbPostTaskThenPostRegistration={postTaskThenPostRegistration}
            />
          </div>
        </Grid>
      </Grid>
    </AuthProvider>
  );
};

export default MainComponent;
