export interface WorkflowSuggestion {
  id: string;
  name: string;
}

export type WorkflowRunDetail = {
  id: string;
  name: string;
  workflowId: string;
  status?: string;
  started: string;
  duration: string;
  category?: string;
  description?: string;
  businessKey?: string;
  nextWorkflowSuggestions?: {
    [key: string]: WorkflowSuggestion | WorkflowSuggestion[];
  };
};
