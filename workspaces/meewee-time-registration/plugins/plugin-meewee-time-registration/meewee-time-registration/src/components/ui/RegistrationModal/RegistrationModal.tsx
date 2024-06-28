import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Autocomplete,
  SelectChangeEvent,
} from '@mui/material';
import { DateTime } from 'luxon';
import {
  ProjectMeta,
  ProjectTaskMeta,
} from '../../../types/request/timeRegistration';
import { RegistrationModalProps } from '../../../types/components/registrationModal';
import { useRegistrationModalStyles } from '../ui.style';
import TimeInput from './TimeInput';

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isModalOpen,
  overallProjects,
  employmentId,
  cbPostRegistration,
  cbCloseModal,
  cbPostTaskThenPostRegistration,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | number | undefined
  >(0);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
    undefined,
  );
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<
    string | null | undefined
  >(undefined);
  const [regDuration, setRegDuration] = useState<number | undefined>();

  const [description, setDescription] = useState<string>('');

  const classes = useRegistrationModalStyles();

  const overAllTask = overallProjects?.reduce(
    (accumulatedTasks: ProjectTaskMeta[], next: ProjectMeta) => {
      if (next.projectTasks) {
        accumulatedTasks = accumulatedTasks.concat(next?.projectTasks);
      }
      return accumulatedTasks;
    },
    [],
  );

  const filteredTasksByProject = overAllTask?.filter(
    item => item?.taskProjectId === selectedProjectId,
  );

  const isRegistrationSubmittable =
    selectedTaskTitle &&
    selectedProjectId &&
    employmentId &&
    isValidRegDuration(regDuration && +regDuration);

  const handleProjectClickChange = (event: SelectChangeEvent<number>) => {
    const projId = event?.target?.value || 0;
    setSelectedProjectId(projId);
  };

  useEffect(() => {
    if (selectedTaskTitle) {
      const taskId = filteredTasksByProject?.find(
        task => task?.taskTitle === selectedTaskTitle,
      )?.taskId;
      setSelectedTaskId(taskId);
    } else {
      setSelectedTaskId(undefined);
    }
  }, [selectedTaskTitle]);

  ////////////////// REG DURATION //////////////////////////////////////

  const handleRegDurationChange = (minutes: number) => {
    const isWholeNumber = /^(?!0$)\d+$/;

    if (isWholeNumber.test(`${minutes}`)) {
      setRegDuration(minutes);
    }
  };

  const clearData = () => {
    setRegDuration(undefined);
    setSelectedProjectId(undefined);
    setSelectedTaskId(undefined);
    setSelectedTaskTitle(undefined);
  };

  useEffect(() => {
    setSelectedTaskId(undefined);
    setSelectedTaskTitle(undefined);
  }, [selectedProjectId]);

  const submitRegistration = () => {
    const numRegDuration = (regDuration && +regDuration) || 0;
    if (isRegistrationSubmittable) {
      const commonRegParams = {
        description: description || '',
        regStatus: 'pending',
        regDate: DateTime.now().toFormat('yyyy-MM-dd'),
        regDuration: numRegDuration,
        projectId: selectedProjectId as number,
        employmentId: employmentId,
      };
      if (selectedTaskId) {
        cbPostRegistration({
          taskId: selectedTaskId,
          ...commonRegParams,
        });
      } else {
        selectedTaskTitle &&
          cbPostTaskThenPostRegistration({
            taskTitle: selectedTaskTitle,
            ...commonRegParams,
          });
      }
      clearData();
    }
  };

  const dialogContent = () => {
    return (
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '15px',
          }}
        >
          <Typography variant="body1" style={{ width: '100px' }}>
            Time
          </Typography>
          <TimeInput cbSetMinutesValue={handleRegDurationChange} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '15px',
          }}
        >
          <Typography variant="body1" style={{ width: '100px' }}>
            Project
          </Typography>
          <Select
            style={{ width: '100%', borderRadius: '11px' }}
            value={selectedProjectId ? +selectedProjectId : 0}
            onChange={handleProjectClickChange}
            placeholder="e.g. 7, 5"
            inputProps={{ 'aria-label': 'Without label' }}
          >
            {overallProjects?.map((project, index) => (
              <MenuItem key={index} value={project?.projectId}>
                {project?.projectName}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '15px',
          }}
        >
          <Typography variant="body1" style={{ width: '100px' }}>
            Task
          </Typography>
          <Autocomplete
            freeSolo
            value={selectedTaskTitle || ''}
            onInputChange={event =>
              // @ts-expect-error: Unreachable code error
              setSelectedTaskTitle(event?.target.value || undefined)
            }
            onChange={(_, value) => setSelectedTaskTitle(value)}
            options={filteredTasksByProject?.map(task => task?.taskTitle)}
            renderInput={params => <TextField {...params} label="Add a task" />}
            style={{ width: '100%' }}
            sx={{ '& fieldset': { borderRadius: 3 } }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '15px',
          }}
        >
          <Typography variant="body1" style={{ width: '100px' }}>
            Description
          </Typography>

          <Autocomplete
            freeSolo
            options={[]}
            onInputChange={event =>
              // @ts-expect-error: Unreachable code error
              setDescription(event?.target.value || '')
            }
            onChange={(_, value) => setDescription(value || '')}
            renderInput={params => (
              <TextField
                {...params}
                label="Enter task description (optional)"
              />
            )}
            style={{ width: '100%' }}
            sx={{ '& fieldset': { borderRadius: 3 } }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <Dialog
        open={isModalOpen}
        onClose={cbCloseModal}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <DialogTitle
          className={classes.dialogTitle}
          id="dialog-title"
          style={{ width: '600px' }}
        >
          Registering for today
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={cbCloseModal}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {dialogContent()}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              submitRegistration();
              cbCloseModal();
            }}
            disabled={!isRegistrationSubmittable}
          >
            Submit for approval
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RegistrationModal;

function isValidRegDuration(value: any) {
  return (
    typeof value === 'number' &&
    !isNaN(value) &&
    Number.isInteger(value) &&
    value !== 0
  );
}
