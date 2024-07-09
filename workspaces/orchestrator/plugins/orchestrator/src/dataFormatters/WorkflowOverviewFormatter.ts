import moment from 'moment';

import {
  WorkflowFormat,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import DataFormatter from './DataFormatter';

export interface FormattedWorkflowOverview {
  readonly id: string;
  readonly name: string;
  readonly lastTriggered: string;
  readonly lastRunStatus: string;
  readonly lastRunId: string;
  readonly category: string;
  readonly avgDuration: string;
  readonly description: string;
  readonly format: WorkflowFormat;
}

const formatDuration = (milliseconds: number): string =>
  moment.duration(milliseconds).humanize();

const WorkflowOverviewFormatter: DataFormatter<
  WorkflowOverview,
  FormattedWorkflowOverview
> = {
  format: (data: WorkflowOverview): FormattedWorkflowOverview => {
    return {
      id: data.workflowId,
      name: data.name ?? VALUE_UNAVAILABLE,
      lastTriggered: data.lastTriggeredMs
        ? moment(data.lastTriggeredMs).toDate().toLocaleString()
        : VALUE_UNAVAILABLE,
      lastRunStatus: data.lastRunStatus ?? VALUE_UNAVAILABLE,
      lastRunId: data.lastRunId ?? VALUE_UNAVAILABLE,
      category: data.category ?? VALUE_UNAVAILABLE,
      avgDuration: data.avgDurationMs
        ? formatDuration(data.avgDurationMs)
        : VALUE_UNAVAILABLE,
      description: data.description ?? VALUE_UNAVAILABLE,
      format: data.format,
    };
  },
};

export default WorkflowOverviewFormatter;
