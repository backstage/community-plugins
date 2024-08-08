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
  AssessedProcessInstance,
  parseWorkflowVariables,
  ProcessInstance,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  WorkflowOverview,
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
  instance: ProcessInstance,
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
    status: instance.state,
    description: instance.description,
    nextWorkflowSuggestions,
    businessKey: instance.businessKey,
  };
};

const AutoOverflowCardContent = styled(CardContent)({
  overflow: 'auto',
});

const TopRowCard = styled(InfoCard)({
  height: '20rem',
});

const MiddleRowCard = styled(InfoCard)({
  height: `calc(2 * 20rem)`,
});

const BottomRowCard = styled(InfoCard)({
  height: '100%',
});

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
  assessedInstance: AssessedProcessInstance;
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
    {} as WorkflowOverview,
  );

  const openWorkflowDescriptionModal = (itemId: string) => {
    if (itemId) {
      orchestratorApi
        .getWorkflowOverview(itemId)
        .then(
          workflow => {
            setCurrentWorkflow(workflow);
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
    setCurrentWorkflow({} as WorkflowOverview);
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
          <TopRowCard title="Details" divider={false}>
            <WorkflowRunDetails
              details={details}
              assessedBy={assessedInstance.assessedBy}
            />
          </TopRowCard>
        </Grid>

        <Grid item xs={6}>
          <TopRowCard title="Results" divider={false}>
            <AutoOverflowCardContent>
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
            </AutoOverflowCardContent>
          </TopRowCard>
        </Grid>

        <Grid item xs={6}>
          <MiddleRowCard title="Workflow definition" divider={false}>
            <WorkflowEditor
              workflowId={assessedInstance.instance.processId}
              kind={EditorViewKind.DIAGRAM_VIEWER}
              editorMode="text"
            />
          </MiddleRowCard>
        </Grid>

        <Grid item xs={6}>
          <MiddleRowCard title="Workflow progress" divider={false}>
            <AutoOverflowCardContent>
              <WorkflowProgress
                workflowError={assessedInstance.instance.error}
                workflowNodes={assessedInstance.instance.nodes}
                workflowStatus={assessedInstance.instance.state}
              />
            </AutoOverflowCardContent>
          </MiddleRowCard>
        </Grid>

        {nextWorkflows.length > 0 ? (
          <Grid item xs={12}>
            <BottomRowCard title="Variables" divider={false}>
              <AutoOverflowCardContent>
                <WorkflowVariablesViewer variables={instanceVariables} />
              </AutoOverflowCardContent>
            </BottomRowCard>
          </Grid>
        ) : null}
      </Grid>
    </Content>
  );
};
WorkflowInstancePageContent.displayName = 'WorkflowInstancePageContent';
