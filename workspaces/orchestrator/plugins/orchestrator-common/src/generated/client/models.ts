/**
 * The ErrorResponse object represents a common structure for handling errors in API responses. It includes essential information about the error, such as the error message and additional optional details.
 */
export type ErrorResponse = {
	/**
	 * A string providing a concise and human-readable description of the encountered error. This field is required in the ErrorResponse object.
	 */
	message?: string;
	/**
	 * An optional field that can contain additional information or context about the error. It provides flexibility for including extra details based on specific error scenarios.
	 */
	additionalInfo?: string;
};



export type WorkflowOverviewListResultDTO = {
	overviews?: Array<WorkflowOverviewDTO>;
	paginationInfo?: PaginationInfoDTO;
};



export type WorkflowOverviewDTO = {
	/**
	 * Workflow unique identifier
	 */
	workflowId?: string;
	/**
	 * Workflow name
	 */
	name?: string;
	format?: WorkflowFormatDTO;
	lastRunId?: string;
	lastTriggeredMs?: number;
	lastRunStatus?: string;
	category?: WorkflowCategoryDTO;
	avgDurationMs?: number;
	description?: string;
};



export type PaginationInfoDTO = {
	pageSize?: number;
	page?: number;
	totalCount?: number;
};



/**
 * Format of the workflow definition
 */
export type WorkflowFormatDTO = 'yaml' | 'json';



/**
 * Category of the workflow
 */
export type WorkflowCategoryDTO = 'assessment' | 'infrastructure';



export type WorkflowListResultDTO = {
	items: Array<WorkflowDTO>;
	paginationInfo: PaginationInfoDTO;
};



export type WorkflowDTO = {
	/**
	 * Workflow unique identifier
	 */
	id: string;
	/**
	 * Workflow name
	 */
	name?: string;
	format: WorkflowFormatDTO;
	category: WorkflowCategoryDTO;
	/**
	 * Description of the workflow
	 */
	description?: string;
	annotations?: Array<string>;
};



export type ProcessInstanceListResultDTO = {
	items?: Array<ProcessInstanceDTO>;
	paginationInfo?: PaginationInfoDTO;
};



export type AssessedProcessInstanceDTO = {
	instance: ProcessInstanceDTO;
	assessedBy?: ProcessInstanceDTO;
};



export type ProcessInstanceDTO = {
	id?: string;
	name?: string;
	workflow?: string;
	status?: ProcessInstanceStatusDTO;
	start?: string;
	end?: string;
	duration?: string;
	category?: WorkflowCategoryDTO;
	description?: string;
	workflowdata?: WorkflowDataDTO;
};



export type WorkflowDataDTO = {
	workflowoptions?: Array<WorkflowOptionsDTO>;
	[key: string]: unknown;
};



export type WorkflowOptionsDTO = Array<WorkflowSuggestionDTO>;

export type WorkflowSuggestionDTO = {
	id?: string;
	name?: string;
};



/**
 * Status of the workflow run
 */
export type ProcessInstanceStatusDTO = 'Running' | 'Error' | 'Completed' | 'Aborted' | 'Suspended' | 'Pending';



export type WorkflowRunStatusDTO = {
	key?: string;
	value?: string;
};



export type ExecuteWorkflowRequestDTO = {
	inputData: Record<string, string>;
};



export type ExecuteWorkflowResponseDTO = {
	id?: string;
};



export type WorkflowProgressDTO = (NodeInstanceDTO & {
status?: ProcessInstanceStatusDTO;
error?: ProcessInstanceErrorDTO;
});



export type NodeInstanceDTO = {
	/**
	 * Type name
	 */
	__typename?: string;
	/**
	 * Node instance ID
	 */
	id?: string;
	/**
	 * Node name
	 */
	name?: string;
	/**
	 * Node type
	 */
	type?: string;
	/**
	 * Date when the node was entered
	 */
	enter?: string;
	/**
	 * Date when the node was exited (optional)
	 */
	exit?: string;
	/**
	 * Definition ID
	 */
	definitionId?: string;
	/**
	 * Node ID
	 */
	nodeId?: string;
};



export type ProcessInstanceErrorDTO = {
	/**
	 * Type name
	 */
	__typename?: string;
	/**
	 * Node definition ID
	 */
	nodeDefinitionId?: string;
	/**
	 * Error message (optional)
	 */
	message?: string;
};

