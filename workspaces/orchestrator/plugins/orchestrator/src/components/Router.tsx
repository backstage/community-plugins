import React from 'react';
import { Route, Routes } from 'react-router-dom';

import {
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
  workflowInstanceRouteRef,
} from '../routes';
import { ExecuteWorkflowPage } from './ExecuteWorkflowPage/ExecuteWorkflowPage';
import { OrchestratorPage } from './OrchestratorPage';
import { WorkflowDefinitionViewerPage } from './WorkflowDefinitionViewerPage';
import { WorkflowInstancePage } from './WorkflowInstancePage';

export const Router = () => {
  return (
    <Routes>
      <Route path="/*" element={<OrchestratorPage />} />
      <Route
        path={workflowInstanceRouteRef.path}
        element={<WorkflowInstancePage />}
      />
      <Route
        path={workflowDefinitionsRouteRef.path}
        element={<WorkflowDefinitionViewerPage />}
      />
      <Route
        path={executeWorkflowRouteRef.path}
        element={<ExecuteWorkflowPage />}
      />
    </Routes>
  );
};
