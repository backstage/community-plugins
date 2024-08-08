import type { CancelablePromise } from './core/CancelablePromise';
import { OpenAPI } from './core/OpenAPI';
import { request as __request } from './core/request';

import type { ExecuteWorkflowRequestDTO,ExecuteWorkflowResponseDTO,ProcessInstanceDTO,ProcessInstanceListResultDTO,WorkflowDataDTO,WorkflowDTO,WorkflowOverviewDTO,WorkflowOverviewListResultDTO,WorkflowRunStatusDTO } from './models';

export type DefaultData = {
        GetWorkflowsOverview: {
                    /**
 * field name to order the data
 */
orderBy?: string
/**
 * ascending or descending
 */
orderDirection?: string
/**
 * page number
 */
page?: number
/**
 * page size
 */
pageSize?: number
                    
                };
GetWorkflowOverviewById: {
                    /**
 * Unique identifier of the workflow
 */
workflowId: string
                    
                };
GetWorkflowById: {
                    /**
 * ID of the workflow to fetch
 */
workflowId: string
                    
                };
GetWorkflowSourceById: {
                    /**
 * ID of the workflow to fetch
 */
workflowId: string
                    
                };
GetInstances: {
                    /**
 * field name to order the data
 */
orderBy?: string
/**
 * ascending or descending
 */
orderDirection?: string
/**
 * page number
 */
page?: number
/**
 * page size
 */
pageSize?: number
                    
                };
GetInstanceById: {
                    /**
 * ID of the workflow instance
 */
instanceId: string
                    
                };
GetWorkflowResults: {
                    /**
 * ID of the workflow instance
 */
instanceId: string
                    
                };
ExecuteWorkflow: {
                    requestBody: ExecuteWorkflowRequestDTO
/**
 * ID of the workflow to execute
 */
workflowId: string
                    
                };
AbortWorkflow: {
                    /**
 * The identifier of the workflow instance to abort.
 */
instanceId: string
                    
                };
    }

export class DefaultService {

	/**
	 * Get a list of workflow overviews
	 * @returns WorkflowOverviewListResultDTO Success
	 * @throws ApiError
	 */
	public static getWorkflowsOverview(data: DefaultData['GetWorkflowsOverview'] = {}): CancelablePromise<WorkflowOverviewListResultDTO> {
		const {
page,
pageSize,
orderBy,
orderDirection,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/v2/workflows/overview',
			query: {
				page, pageSize, orderBy, orderDirection
			},
			errors: {
				500: `Error fetching workflow overviews`,
			},
		});
	}

	/**
	 * Get a workflow overview by ID
	 * @returns WorkflowOverviewDTO Success
	 * @throws ApiError
	 */
	public static getWorkflowOverviewById(data: DefaultData['GetWorkflowOverviewById']): CancelablePromise<WorkflowOverviewDTO> {
		const {
workflowId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/v2/workflows/{workflowId}/overview',
			path: {
				workflowId
			},
			errors: {
				500: `Error fetching workflow overview`,
			},
		});
	}

	/**
	 * Get a workflow by ID
	 * @returns WorkflowDTO Success
	 * @throws ApiError
	 */
	public static getWorkflowById(data: DefaultData['GetWorkflowById']): CancelablePromise<WorkflowDTO> {
		const {
workflowId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/v2/workflows/{workflowId}',
			path: {
				workflowId
			},
			errors: {
				500: `Error fetching workflow by id`,
			},
		});
	}

	/**
	 * Get a workflow source by ID
	 * @returns string Success
	 * @throws ApiError
	 */
	public static getWorkflowSourceById(data: DefaultData['GetWorkflowSourceById']): CancelablePromise<string> {
		const {
workflowId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/v2/workflows/{workflowId}/source',
			path: {
				workflowId
			},
			errors: {
				500: `Error fetching workflow source by id`,
			},
		});
	}

	/**
	 * Get instances
	 * Retrieve an array of instances
	 * @returns ProcessInstanceListResultDTO Success
	 * @throws ApiError
	 */
	public static getInstances(data: DefaultData['GetInstances'] = {}): CancelablePromise<ProcessInstanceListResultDTO> {
		const {
page,
pageSize,
orderBy,
orderDirection,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/v2/workflows/instances',
			query: {
				page, pageSize, orderBy, orderDirection
			},
			errors: {
				500: `Error fetching instances`,
			},
		});
	}

	/**
	 * Get Workflow Instance by ID
	 * @returns ProcessInstanceDTO Successful response
	 * @throws ApiError
	 */
	public static getInstanceById(data: DefaultData['GetInstanceById']): CancelablePromise<ProcessInstanceDTO> {
		const {
instanceId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/v2/workflows/instances/{instanceId}',
			path: {
				instanceId
			},
			errors: {
				500: `Error fetching instance`,
			},
		});
	}

	/**
	 * Get workflow results
	 * @returns WorkflowDataDTO Successful response
	 * @throws ApiError
	 */
	public static getWorkflowResults(data: DefaultData['GetWorkflowResults']): CancelablePromise<WorkflowDataDTO> {
		const {
instanceId,
} = data;
		return __request(OpenAPI, {
			method: 'GET',
			url: '/v2/workflows/instances/{instanceId}/results',
			path: {
				instanceId
			},
			errors: {
				500: `Error getting workflow results`,
			},
		});
	}

	/**
	 * Get workflow status list
	 * Retrieve an array of workflow statuses
	 * @returns WorkflowRunStatusDTO Success
	 * @throws ApiError
	 */
	public static getWorkflowStatuses(): CancelablePromise<Array<WorkflowRunStatusDTO>> {
				return __request(OpenAPI, {
			method: 'GET',
			url: '/v2/workflows/instances/statuses',
			errors: {
				500: `Error fetching workflow statuses`,
			},
		});
	}

	/**
	 * Execute a workflow
	 * @returns ExecuteWorkflowResponseDTO Successful execution
	 * @throws ApiError
	 */
	public static executeWorkflow(data: DefaultData['ExecuteWorkflow']): CancelablePromise<ExecuteWorkflowResponseDTO> {
		const {
workflowId,
requestBody,
} = data;
		return __request(OpenAPI, {
			method: 'POST',
			url: '/v2/workflows/{workflowId}/execute',
			path: {
				workflowId
			},
			body: requestBody,
			mediaType: 'application/json',
			errors: {
				500: `Internal Server Error`,
			},
		});
	}

	/**
	 * Abort a workflow instance
	 * Aborts a workflow instance identified by the provided instanceId.
	 * @returns string Successful operation
	 * @throws ApiError
	 */
	public static abortWorkflow(data: DefaultData['AbortWorkflow']): CancelablePromise<string> {
		const {
instanceId,
} = data;
		return __request(OpenAPI, {
			method: 'DELETE',
			url: '/v2/instances/{instanceId}/abort',
			path: {
				instanceId
			},
			errors: {
				500: `Error aborting workflow`,
			},
		});
	}

}