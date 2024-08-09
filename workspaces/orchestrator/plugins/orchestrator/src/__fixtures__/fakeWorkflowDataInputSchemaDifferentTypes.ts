import { WorkflowInputSchemaResponse } from '@backstage-community/plugin-orchestrator-common';

export const fakeDataInputSchemaDifferentTypes: WorkflowInputSchemaResponse = {
  definition: {
    id: 'yamlgreet',
    version: '1.0',
    specVersion: '0.8',
    name: 'Greeting workflow',
    description: 'YAML based greeting workflow',
    dataInputSchema: 'schemas/yamlgreet__main_schema.json',
    start: 'ChooseOnLanguage',
    functions: [
      {
        name: 'greetFunction',
        type: 'custom',
        operation: 'sysout',
      },
    ],
    states: [
      {
        name: 'ChooseOnLanguage',
        type: 'switch',
        dataConditions: [
          {
            condition: '${ .language == "English" }',
            transition: 'GreetInEnglish',
          },
          {
            condition: '${ .language == "Spanish" }',
            transition: 'GreetInSpanish',
          },
        ],
        defaultCondition: {
          transition: 'GreetInEnglish',
        },
      },
      {
        name: 'GreetInEnglish',
        type: 'inject',
        data: {
          greeting: 'Hello from YAML Workflow, ',
        },
        transition: 'GreetPerson',
      },
      {
        name: 'GreetInSpanish',
        type: 'inject',
        data: {
          greeting: 'Saludos desde YAML Workflow, ',
        },
        transition: 'GreetPerson',
      },
      {
        name: 'GreetPerson',
        type: 'operation',
        actions: [
          {
            name: 'greetAction',
            functionRef: {
              refName: 'greetFunction',
              arguments: {
                message: '.greeting+.name',
              },
            },
          },
        ],
        end: {
          terminate: true,
        },
      },
    ],
  },
  isComposedSchema: true,
  schemaSteps: [
    {
      title: 'Boolean field',
      schema: {
        type: 'object',
        properties: {
          default: {
            type: 'boolean',
            title: 'checkbox (default)',
            description: 'This is the checkbox-description',
          },
        },
      },
      key: 'booleanfield',
      readonlyKeys: [],
      data: {},
    },
    {
      title: 'String formats',
      schema: {
        type: 'object',

        properties: {
          email: {
            type: 'string',
            format: 'email',
          },
          uri: {
            type: 'string',
            format: 'uri',
          },
        },
      },
      data: {},
      readonlyKeys: [],
      key: 'string-formats',
    },
    {
      readonlyKeys: [],
      key: 'select',
      title: 'Select',
      data: {},
      schema: {
        title: 'Select',
        type: 'object',
        properties: {
          select: {
            title: 'Select widget with options',
            type: 'string',
            enum: ['pizza', 'pasta', 'canaloni', 'ravioli'],
          },
        },
      },
    },
    {
      readonlyKeys: [],
      key: 'dateandtime',
      title: 'Date and time',
      data: {},
      schema: {
        type: 'object',
        properties: {
          datetime: {
            type: 'string',
            format: 'date-time',
          },
          date: {
            type: 'string',
            format: 'date',
          },
          time: {
            type: 'string',
            format: 'time',
          },
        },
      },
    },
    {
      key: 'array',
      title: 'Array',
      schema: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            title: 'Task list title',
          },
          tasks: {
            type: 'array',
            title: 'Tasks',
            items: {
              type: 'object',
              required: ['title'],
              properties: {
                title: {
                  type: 'string',
                  title: 'Title',
                  description: 'A sample title',
                },
                details: {
                  type: 'string',
                  title: 'Task details',
                  description: 'Enter the task details',
                },
                done: {
                  type: 'boolean',
                  title: 'Done?',
                  default: false,
                },
              },
            },
          },
        },
      },
      data: { title: 'my task list' },
      readonlyKeys: ['title'],
    },
  ],
};
