import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
  useQueryParamState,
} from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';

import Grid from '@mui/material/Grid';

import {
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_INSTANCE_ID,
  QUERY_PARAM_INSTANCE_STATE,
  WorkflowInputSchemaResponse,
} from '@backstage-community/plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { getErrorObject } from '../../utils/ErrorUtils';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage';
import JsonTextAreaForm from './JsonTextAreaForm';
import StepperForm from './StepperForm';

export const ExecuteWorkflowPage = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const [isExecuting, setIsExecuting] = useState(false);
  const [updateError, setUpdateError] = React.useState<Error>();
  const [instanceId] = useQueryParamState<string>(QUERY_PARAM_INSTANCE_ID);
  const [assessmentInstanceId] = useQueryParamState<string>(
    QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  );
  const [instanceState] = useQueryParamState<string>(
    QUERY_PARAM_INSTANCE_STATE,
  );
  const navigate = useNavigate();
  const instanceLink = useRouteRef(workflowInstanceRouteRef);
  const {
    value: schemaResponse,
    loading,
    error: responseError,
  } = useAsync(
    async (): Promise<WorkflowInputSchemaResponse> =>
      await orchestratorApi.getWorkflowDataInputSchema({
        workflowId,
        instanceId,
        assessmentInstanceId,
      }),
    [orchestratorApi, workflowId],
  );

  const handleExecute = useCallback(
    async (getParameters: () => JsonObject) => {
      setUpdateError(undefined);
      let parameters: JsonObject = {};
      try {
        parameters = getParameters();
      } catch (err) {
        setUpdateError(getErrorObject(err));
        return;
      }
      try {
        setIsExecuting(true);
        const response = await orchestratorApi.executeWorkflow({
          workflowId,
          parameters,
          businessKey: assessmentInstanceId,
        });
        navigate(instanceLink({ instanceId: response.id }));
      } catch (err) {
        setUpdateError(getErrorObject(err));
      } finally {
        setIsExecuting(false);
      }
    },
    [orchestratorApi, workflowId, navigate, instanceLink, assessmentInstanceId],
  );

  const isErrorState = React.useMemo(
    () => instanceState === 'ERROR',
    [instanceState],
  );

  const handleRetrigger = useCallback(
    async (getParameters: () => JsonObject) => {
      setUpdateError(undefined);
      let parameters: JsonObject = {};
      try {
        parameters = getParameters();
      } catch (err) {
        setUpdateError(getErrorObject(err));
        return;
      }
      if (instanceId) {
        try {
          setIsExecuting(true);
          const response = await orchestratorApi.retriggerInstanceInError({
            instanceId,
            inputData: parameters,
          });
          navigate(instanceLink({ instanceId: response.id }));
        } catch (err) {
          setUpdateError(getErrorObject(err));
        } finally {
          setIsExecuting(false);
        }
      }
    },
    [orchestratorApi, instanceId, navigate, instanceLink],
  );

  const onReset = useCallback(() => {
    setUpdateError(undefined);
  }, [setUpdateError]);

  let pageContent;

  if (loading) {
    pageContent = <Progress />;
  } else if (responseError) {
    pageContent = <ResponseErrorPanel error={responseError} />;
  } else if (!schemaResponse) {
    pageContent = (
      <ResponseErrorPanel
        error={
          new Error('Request for data input schema returned an empty response')
        }
      />
    );
  } else {
    pageContent = (
      <Grid container spacing={2} direction="column" wrap="nowrap">
        {updateError && (
          <Grid item>
            <ResponseErrorPanel error={updateError} />
          </Grid>
        )}
        {schemaResponse.schemaParseError && (
          <Grid item>
            <ResponseErrorPanel
              error={
                new Error(
                  `Failed to parse schema: ${schemaResponse.schemaParseError}`,
                )
              }
            />
          </Grid>
        )}
        <Grid item>
          <InfoCard title="Run workflow">
            {schemaResponse.schemaSteps.length > 0 ? (
              <StepperForm
                steps={schemaResponse.schemaSteps}
                isComposedSchema={schemaResponse.isComposedSchema}
                handleExecute={isErrorState ? handleRetrigger : handleExecute}
                isExecuting={isExecuting}
                onReset={onReset}
              />
            ) : (
              <JsonTextAreaForm
                handleExecute={isErrorState ? handleRetrigger : handleExecute}
                isExecuting={isExecuting}
              />
            )}
          </InfoCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <BaseOrchestratorPage
      noPadding={loading}
      title={schemaResponse?.definition.name ?? workflowId}
      type="Workflows"
      typeLink="/orchestrator"
    >
      {pageContent}
    </BaseOrchestratorPage>
  );
};
