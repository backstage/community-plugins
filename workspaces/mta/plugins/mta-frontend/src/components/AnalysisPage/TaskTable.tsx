import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import ErrorIcon from '@material-ui/icons/Error';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled';
import { TaskDashboard } from '../../api/api';
import { useEntity } from '@backstage/plugin-catalog-react';

const getIconForState = (state: string) => {
  switch (state) {
    case 'Succeeded':
      return <CheckCircleIcon style={{ color: 'green' }} />;
    case 'Failed':
      return <CancelIcon style={{ color: 'red' }} />;
    case 'Running':
      return <HourglassEmptyIcon style={{ color: 'blue' }} />;
    case 'Canceled':
      return <PauseCircleFilledIcon style={{ color: 'orange' }} />;
    case 'SucceededWithErrors':
      return <ErrorIcon style={{ color: 'yellow' }} />;
    default:
      return <ErrorIcon style={{ color: 'gray' }} />;
  }
};
interface ITaskTableProps {
  tasks: TaskDashboard[];
  isFetching: boolean;
}

const TaskTable = ({ tasks, isFetching }: ITaskTableProps) => {
  const entity = useEntity();
  const annotations = entity?.entity?.metadata?.annotations || {};
  const mtaUrl = annotations['mta-url'] || '';

  const isValidDate = (date: Date) => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  if (isFetching && !tasks) {
    return <div>Loading...</div>;
  }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>State</TableCell>
            <TableCell>Started</TableCell>
            <TableCell>Terminated</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks?.map(task => (
            <TableRow key={task.id}>
              <TableCell>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ marginRight: 8 }}>
                    {getIconForState(task.state)}
                  </div>
                  <Typography>{task.state}</Typography>
                </div>
              </TableCell>
              <TableCell>
                {isValidDate(new Date(task.started || ''))
                  ? new Date(task.started || '').toLocaleString()
                  : 'N/A'}
              </TableCell>
              <TableCell>
                {isValidDate(new Date(task.terminated || ''))
                  ? new Date(task.terminated || '').toLocaleString()
                  : 'N/A'}
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  color="primary"
                  endIcon={<OpenInNewIcon />}
                  onClick={() => {
                    // Open in a new window/tab without affecting current navigation
                    window.open(
                      `${mtaUrl}/tasks/${task.id}`,
                      '_blank',
                      'noopener,noreferrer',
                    );
                  }}
                >
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskTable;
