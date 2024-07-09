import { JsonObject } from '@backstage/types';

import { JSONSchema7 } from 'json-schema';

import { WorkflowDefinition } from '@janus-idp/backstage-plugin-orchestrator-common';

const schema = {
  $id: 'classpath:/schemas/yamlgreet__main-schema.json',
  title: 'Data Input Schema',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    language: {
      type: 'object',
      properties: {
        language: {
          title: 'Language',
          description: 'Language to greet',
          type: 'string',
          enum: ['English', 'Spanish'],
          default: 'English',
        },
      },
      title: 'Language',
    },
    name: {
      type: 'object',
      properties: {
        name: {
          title: 'Name',
          description: 'Name of the person',
          type: 'string',
          default: 'John Doe',
        },
      },
    },
  },
  required: ['name'],
} as JSONSchema7;

const workflowDefinition = {
  id: 'yamlgreet',
  version: '1.0',
  specVersion: '0.8',
  name: 'Greeting workflow',
  description: 'YAML based greeting workflow',
  dataInputSchema: 'schemas/yamlgreet__main-schema.json',
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
          condition: '${ .language.language == "English" }',
          transition: 'GreetInEnglish',
        },
        {
          condition: '${ .language.language == "Spanish" }',
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
              message: '.greeting+.name.name',
            },
          },
        },
      ],
      end: {
        terminate: true,
      },
    },
  ],
} as WorkflowDefinition;

const variables = {
  workflowdata: {
    name: {
      name: 'John Doe',
    },
    language: {
      language: 'Spanish',
    },
    greeting: 'hello',
  },
};

const mockData: {
  schema: JSONSchema7;
  workflowDefinition: WorkflowDefinition;
  variables: JsonObject;
} = { schema, workflowDefinition, variables };

export default mockData;
