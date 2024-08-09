import { useTheme } from '@mui/material/styles';

import { ProcessInstanceStatusDTO } from '@backstage-community/plugin-orchestrator-common';

export const useWorkflowInstanceStateColors = (
  value?: ProcessInstanceStatusDTO,
) => {
  const theme = useTheme();
  const colors = {
    [ProcessInstanceStatusDTO.Active]: theme.palette.primary.main,
    [ProcessInstanceStatusDTO.Completed]: theme.palette.success.main,
    [ProcessInstanceStatusDTO.Suspended]: theme.palette.warning.main,
    [ProcessInstanceStatusDTO.Aborted]: theme.palette.error.main,
    [ProcessInstanceStatusDTO.Error]: theme.palette.error.main,
    [ProcessInstanceStatusDTO.Pending]: theme.palette.grey[500],
  };
  return value ? colors[value] : undefined;
};
