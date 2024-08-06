import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';
import { Button, Typography } from '@material-ui/core';
import { RegistrationTableProps } from '../../types/components/registrationTable';
import RegistrationModal from './RegistrationModal/RegistrationModal';
import { useRegistrationTableStyles } from './ui.style';

const RegistrationTable = ({
  isModalOpen,
  registrations,
  overallProjects,
  registrationsTotalTime,
  employmentId,
  isRegistrationLoading,
  cbSetModalState,
  cbPostRegistration,
  cbPostTaskThenPostRegistration,
  authToken,
}: RegistrationTableProps) => {
  const classes = useRegistrationTableStyles();

  const handleRegisterClick = () => {
    if (authToken) {
      cbSetModalState(true);
    } else {
      console.log('No auth token available.');
    }
  };

  return (
    <div className={classes.table}>
      <Table
        options={{ paging: true, search: false, padding: 'dense' }}
        title={
          <div className={classes.table_title}>
            <Typography>Daily Registrations</Typography>
            <Typography className={classes.table_total}>
              Total time:{' '}
              <span className={classes.table_count}>
                {registrationsTotalTime}
              </span>
            </Typography>
          </div>
        }
        data={registrations}
        columns={columns}
        isLoading={isRegistrationLoading}
        actions={[
          {
            icon: () => (
              <RegistrationModal
                isModalOpen={isModalOpen}
                overallProjects={overallProjects}
                employmentId={employmentId}
                cbCloseModal={() => cbSetModalState(false)}
                cbPostRegistration={cbPostRegistration}
                cbPostTaskThenPostRegistration={cbPostTaskThenPostRegistration}
              />
            ),
            tooltip: 'Button',
            isFreeAction: true,
            onClick: () => undefined,
          },
        ]}
        emptyContent={
          <div className={classes.empty}>
            No data was added yet.&nbsp;
            <Button
              className={classes.empty_register}
              onClick={handleRegisterClick}
            >
              Click here to register your tasks.
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default RegistrationTable;

const columns: TableColumn[] = [
  {
    title: 'Task title',
    field: 'taskTitle',
    highlight: true,
  },
  {
    title: 'Date',
    field: 'date',
    type: 'date',
    highlight: true,
  },
  {
    title: 'Project',
    field: 'projectName',
    highlight: true,
  },
  {
    title: 'Time',
    field: 'time',
    highlight: true,
    width: '100px',
    cellStyle: {
      textAlign: 'center',
    },
  },
];
