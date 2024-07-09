import { useTheme } from '@mui/material/styles';

import {
  ProcessInstanceState,
  ProcessInstanceStateValues,
} from '@backstage-community/plugin-orchestrator-common';

export const useWorkflowInstanceStateColors = (
  value?: ProcessInstanceStateValues,
) => {
  const theme = useTheme();
  const colors = {
    [ProcessInstanceState.Active]: theme.palette.primary.main,
    [ProcessInstanceState.Completed]: theme.palette.success.main,
    [ProcessInstanceState.Suspended]: theme.palette.warning.main,
    [ProcessInstanceState.Aborted]: theme.palette.error.main,
    [ProcessInstanceState.Error]: theme.palette.error.main,
    [ProcessInstanceState.Pending]: theme.palette.grey[500],
  };
  return value ? colors[value] : undefined;
};
