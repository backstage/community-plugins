export const $ErrorResponse = {
	description: `The ErrorResponse object represents a common structure for handling errors in API responses. It includes essential information about the error, such as the error message and additional optional details.`,
	properties: {
		message: {
	type: 'string',
	description: `A string providing a concise and human-readable description of the encountered error. This field is required in the ErrorResponse object.`,
	default: 'internal server error',
	isRequired: true,
},
		additionalInfo: {
	type: 'string',
	description: `An optional field that can contain additional information or context about the error. It provides flexibility for including extra details based on specific error scenarios.`,
},
	},
} as const;

export const $WorkflowOverviewListResultDTO = {
	properties: {
		overviews: {
	type: 'array',
	contains: {
		type: 'WorkflowOverviewDTO',
	},
},
		paginationInfo: {
	type: 'PaginationInfoDTO',
},
	},
} as const;

export const $WorkflowOverviewDTO = {
	properties: {
		workflowId: {
	type: 'string',
	description: `Workflow unique identifier`,
	minLength: 1,
},
		name: {
	type: 'string',
	description: `Workflow name`,
	minLength: 1,
},
		format: {
	type: 'WorkflowFormatDTO',
},
		lastRunId: {
	type: 'string',
},
		lastTriggeredMs: {
	type: 'number',
	minimum: 0,
},
		lastRunStatus: {
	type: 'string',
},
		category: {
	type: 'WorkflowCategoryDTO',
},
		avgDurationMs: {
	type: 'number',
	minimum: 0,
},
		description: {
	type: 'string',
},
	},
} as const;

export const $PaginationInfoDTO = {
	properties: {
		pageSize: {
	type: 'number',
	minimum: 0,
},
		page: {
	type: 'number',
	minimum: 0,
},
		totalCount: {
	type: 'number',
	minimum: 0,
},
	},
} as const;

export const $WorkflowFormatDTO = {
	type: 'Enum',
	enum: ['yaml','json',],
} as const;

export const $WorkflowCategoryDTO = {
	type: 'Enum',
	enum: ['assessment','infrastructure',],
} as const;

export const $WorkflowListResultDTO = {
	properties: {
		items: {
	type: 'array',
	contains: {
		type: 'WorkflowDTO',
	},
	isRequired: true,
},
		paginationInfo: {
	type: 'PaginationInfoDTO',
	isRequired: true,
},
	},
} as const;

export const $WorkflowDTO = {
	properties: {
		id: {
	type: 'string',
	description: `Workflow unique identifier`,
	isRequired: true,
	minLength: 1,
},
		name: {
	type: 'string',
	description: `Workflow name`,
	minLength: 1,
},
		format: {
	type: 'WorkflowFormatDTO',
	isRequired: true,
},
		category: {
	type: 'WorkflowCategoryDTO',
	isRequired: true,
},
		description: {
	type: 'string',
	description: `Description of the workflow`,
},
		annotations: {
	type: 'array',
	contains: {
	type: 'string',
},
},
	},
} as const;

export const $ProcessInstanceListResultDTO = {
	properties: {
		items: {
	type: 'array',
	contains: {
		type: 'ProcessInstanceDTO',
	},
},
		paginationInfo: {
	type: 'PaginationInfoDTO',
},
	},
} as const;

export const $AssessedProcessInstanceDTO = {
	properties: {
		instance: {
	type: 'ProcessInstanceDTO',
	isRequired: true,
},
		assessedBy: {
	type: 'ProcessInstanceDTO',
},
	},
} as const;

export const $ProcessInstanceDTO = {
	properties: {
		id: {
	type: 'string',
},
		name: {
	type: 'string',
},
		workflow: {
	type: 'string',
},
		status: {
	type: 'ProcessInstanceStatusDTO',
},
		start: {
	type: 'string',
},
		end: {
	type: 'string',
},
		duration: {
	type: 'string',
},
		category: {
	type: 'WorkflowCategoryDTO',
},
		description: {
	type: 'string',
},
		workflowdata: {
	type: 'WorkflowDataDTO',
},
	},
} as const;

export const $WorkflowDataDTO = {
	properties: {
		workflowoptions: {
	type: 'array',
	contains: {
		type: 'WorkflowOptionsDTO',
	},
},
	},
} as const;

export const $WorkflowOptionsDTO = {
	type: 'array',
	contains: {
		type: 'WorkflowSuggestionDTO',
	},
} as const;

export const $WorkflowSuggestionDTO = {
	properties: {
		id: {
	type: 'string',
},
		name: {
	type: 'string',
},
	},
} as const;

export const $ProcessInstanceStatusDTO = {
	type: 'Enum',
	enum: ['Running','Error','Completed','Aborted','Suspended','Pending',],
} as const;

export const $WorkflowRunStatusDTO = {
	properties: {
		key: {
	type: 'string',
},
		value: {
	type: 'string',
},
	},
} as const;

export const $ExecuteWorkflowRequestDTO = {
	properties: {
		inputData: {
	type: 'dictionary',
	contains: {
	type: 'string',
},
	isRequired: true,
},
	},
} as const;

export const $ExecuteWorkflowResponseDTO = {
	properties: {
		id: {
	type: 'string',
},
	},
} as const;

export const $WorkflowProgressDTO = {
	type: 'all-of',
	contains: [{
	type: 'NodeInstanceDTO',
}, {
	properties: {
		status: {
	type: 'ProcessInstanceStatusDTO',
},
		error: {
	type: 'ProcessInstanceErrorDTO',
},
	},
}],
} as const;

export const $NodeInstanceDTO = {
	properties: {
		__typename: {
	type: 'string',
	description: `Type name`,
	default: 'NodeInstance',
},
		id: {
	type: 'string',
	description: `Node instance ID`,
},
		name: {
	type: 'string',
	description: `Node name`,
},
		type: {
	type: 'string',
	description: `Node type`,
},
		enter: {
	type: 'string',
	description: `Date when the node was entered`,
},
		exit: {
	type: 'string',
	description: `Date when the node was exited (optional)`,
},
		definitionId: {
	type: 'string',
	description: `Definition ID`,
},
		nodeId: {
	type: 'string',
	description: `Node ID`,
},
	},
} as const;

export const $ProcessInstanceErrorDTO = {
	properties: {
		__typename: {
	type: 'string',
	description: `Type name`,
	default: 'ProcessInstanceError',
},
		nodeDefinitionId: {
	type: 'string',
	description: `Node definition ID`,
},
		message: {
	type: 'string',
	description: `Error message (optional)`,
},
	},
} as const;