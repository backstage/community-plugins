import React from 'react';

import { Content, InfoCard, Link } from '@backstage/core-components';
import {
  PathParams,
  RouteFunc,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';

import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import moment from 'moment';

import {
  AssessedProcessInstanceDTO,
  parseWorkflowVariables,
  ProcessInstanceDTO,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  WorkflowOverviewDTO,
} from '@backstage-community/plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import { VALUE_UNAVAILABLE } from '../constants';
import { executeWorkflowRouteRef } from '../routes';
import { buildUrl } from '../utils/UrlUtils';
import { WorkflowDescriptionModal } from './WorkflowDescriptionModal';
import { EditorViewKind, WorkflowEditor } from './WorkflowEditor';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowRunDetail, WorkflowSuggestion } from './WorkflowRunDetail';
import { WorkflowRunDetails } from './WorkflowRunDetails';
import { WorkflowVariablesViewer } from './WorkflowVariablesViewer';

export const mapProcessInstanceToDetails = (
  instance: ProcessInstanceDTO,
): WorkflowRunDetail => {
  const name = instance.processName || instance.processId;
  const start = instance.start ? moment(instance.start) : undefined;
  let duration: string = VALUE_UNAVAILABLE;
  if (start && instance.end) {
    const end = moment(instance.end);
    duration = moment.duration(start.diff(end)).humanize();
  }

  const started = start?.toDate().toLocaleString() ?? VALUE_UNAVAILABLE;
  const variables = parseWorkflowVariables(instance?.variables);
  const nextWorkflowSuggestions: WorkflowRunDetail['nextWorkflowSuggestions'] =
    // @ts-ignore
    variables?.workflowdata?.workflowOptions;

  return {
    id: instance.id,
    name,
    workflowId: instance.processId,
    started,
    duration,
    category: instance.category,
    status: instance.status,
    description: instance.description,
    nextWorkflowSuggestions,
    businessKey: instance.businessKey,
  };
};

const middleRowHeight = `calc(2 * 16rem)`;
const topRowHeight = '16rem';

const RecommendedLabelContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
});

const RecommendedLabel = styled(Chip)({
  margin: '0 0.25rem',
});

const getNextWorkflows = (
  details: WorkflowRunDetail,
  executeWorkflowLink: RouteFunc<PathParams<'/workflows/:workflowId/execute'>>,
) => {
  const nextWorkflows: {
    title: string;
    link: string;
    id: string;
    isRecommended: boolean;
  }[] = [];

  if (details.nextWorkflowSuggestions) {
    Object.entries(details.nextWorkflowSuggestions).forEach(([_, value]) => {
      const nextWorkflowSuggestions: WorkflowSuggestion[] = Array.isArray(value)
        ? value
        : [value];
      nextWorkflowSuggestions.forEach(nextWorkflowSuggestion => {
        // Produce flat structure
        const routeUrl = executeWorkflowLink({
          workflowId: nextWorkflowSuggestion.id,
        });
        const urlToNavigate = buildUrl(routeUrl, {
          [QUERY_PARAM_ASSESSMENT_INSTANCE_ID]: details.id,
        });
        nextWorkflows.push({
          title: nextWorkflowSuggestion.name,
          link: urlToNavigate,
          id: nextWorkflowSuggestion.id,
          isRecommended:
            (
              details.nextWorkflowSuggestions
                ?.currentVersion as WorkflowSuggestion
            )?.id === nextWorkflowSuggestion.id,
        });
      });
    });
  }

  return nextWorkflows;
};

export const WorkflowInstancePageContent: React.FC<{
  assessedInstance: AssessedProcessInstanceDTO;
}> = ({ assessedInstance }) => {
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const details = React.useMemo(
    () => mapProcessInstanceToDetails(assessedInstance.instance),
    [assessedInstance.instance],
  );
  const orchestratorApi = useApi(orchestratorApiRef);

  const [
    currentOpenedWorkflowDescriptionModalID,
    setCurrentOpenedWorkflowDescriptionModalID,
  ] = React.useState('');
  const [currentWorkflow, setCurrentWorkflow] = React.useState(
    {} as WorkflowOverviewDTO,
  );

  const openWorkflowDescriptionModal = (itemId: string) => {
    if (itemId) {
      orchestratorApi
        .getWorkflowOverview(itemId)
        .then(
          workflow => {
            setCurrentWorkflow(workflow.data);
          },
          error => {
            throw new Error(error);
          },
        )
        .catch(error => {
          throw new Error(error);
        });
      setCurrentOpenedWorkflowDescriptionModalID(itemId);
    }
  };

  const closeWorkflowDescriptionModal = () => {
    setCurrentOpenedWorkflowDescriptionModalID('');
    setCurrentWorkflow({} as WorkflowOverviewDTO);
  };

  const nextWorkflows = React.useMemo(
    () => getNextWorkflows(details, executeWorkflowLink),
    [details, executeWorkflowLink],
  );

  const instanceVariables = React.useMemo(
    () => parseWorkflowVariables(assessedInstance.instance.variables),
    [assessedInstance],
  );

  return (
    <Content noPadding>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <InfoCard title="Details" divider={false}>
            <CardContent style={{ height: topRowHeight }}>
              <WorkflowRunDetails
                details={details}
                assessedBy={assessedInstance.assessedBy}
              />
            </CardContent>
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard title="Results" divider={false}>
            <CardContent style={{ height: topRowHeight, overflow: 'auto' }}>
              {nextWorkflows.length === 0 ? (
                <WorkflowVariablesViewer variables={instanceVariables} />
              ) : (
                <Grid container spacing={3}>
                  {nextWorkflows.map(item => (
                    <Grid item xs={4} key={item.title}>
                      <RecommendedLabelContainer key={item.title}>
                        <Link
                          color="primary"
                          to="#"
                          onClick={() => {
                            openWorkflowDescriptionModal(item.id);
                          }}
                        >
                          {item.title}
                        </Link>
                        {item.isRecommended ? (
                          <RecommendedLabel
                            size="small"
                            label="Recommended"
                            color="secondary"
                          />
                        ) : null}
                      </RecommendedLabelContainer>
                      <WorkflowDescriptionModal
                        workflow={currentWorkflow}
                        runWorkflowLink={item.link}
                        open={
                          item.id === currentOpenedWorkflowDescriptionModalID
                        }
                        onClose={closeWorkflowDescriptionModal}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard title="Workflow definition" divider={false}>
            <CardContent style={{ height: middleRowHeight }}>
              <WorkflowEditor
                workflowId={assessedInstance.instance.processId}
                kind={EditorViewKind.DIAGRAM_VIEWER}
                editorMode="text"
              />
            </CardContent>
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard title="Workflow progress" divider={false}>
            <CardContent style={{ height: middleRowHeight, overflow: 'auto' }}>
              <WorkflowProgress
                workflowError={assessedInstance.instance.error}
                workflowNodes={assessedInstance.instance.nodes}
                workflowStatus={assessedInstance.instance.status}
              />
            </CardContent>
          </InfoCard>
        </Grid>

        {nextWorkflows.length > 0 ? (
          <Grid item xs={12}>
            <InfoCard title="Variables" divider={false}>
              <CardContent style={{ height: '100%', overflow: 'auto' }}>
                <WorkflowVariablesViewer variables={instanceVariables} />
              </CardContent>
            </InfoCard>
          </Grid>
        ) : null}
      </Grid>
    </Content>
  );
};
WorkflowInstancePageContent.displayName = 'WorkflowInstancePageContent';
