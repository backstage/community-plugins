import { WorkflowInputSchemaResponse } from '@backstage-community/plugin-orchestrator-common';

export const fakeDataInputSchemaResponse: WorkflowInputSchemaResponse = {
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
  schemaSteps: [
    {
      readonlyKeys: [],
      data: {},
      key: 'yamlgreet',
      title: 'yamlgreet: Additional input data',
      schema: {
        $id: 'classpath:/schemas/yamlgreet__sub_schema__Additional_input_data.json',
        title: 'yamlgreet: Additional input data',
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        required: ['language'],
        properties: {
          language: {
            title: 'language',
            type: 'string',
            pattern: 'Spanish|English',
            description: 'Extracted from the Workflow definition',
            default: 'English',
          },
        },
      },
    },
  ],
  isComposedSchema: false,
};
