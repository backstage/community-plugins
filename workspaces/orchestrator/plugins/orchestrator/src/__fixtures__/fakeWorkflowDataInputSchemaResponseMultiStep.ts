import { WorkflowInputSchemaResponse } from '@backstage-community/plugin-orchestrator-common';

export const fakeDataInputSchemaMultiStepResponse: WorkflowInputSchemaResponse =
  {
    definition: {
      id: 'ansible-job-template',
      version: '1.0',
      specVersion: '0.8',
      name: 'Ansible Job Template',
      description:
        'Define an Ansible Job Template within Ansible Automation Platform',
      dataInputSchema: 'schemas/ansible-job-template__main-schema.json',
      functions: [
        {
          name: 'runActionFetchTemplate',
          operation: 'specs/actions-openapi.json#fetch:template',
        },
        {
          name: 'runActionGitHubRepoPush',
          operation: 'specs/actions-openapi.json#github:repo:push',
        },
        {
          name: 'runActionCatalogRegister',
          operation: 'specs/actions-openapi.json#catalog:register',
        },
        {
          name: 'fs:delete',
          operation: 'specs/actions-openapi.json#fs:delete',
        },
        {
          name: 'sysout',
          type: 'custom',
          operation: 'sysout',
        },
      ],
      errors: [
        {
          name: 'Error on Action',
          code: 'java.lang.RuntimeException',
        },
      ],
      start: 'Code and Catalog generation',
      states: [
        {
          name: 'Code and Catalog generation',
          type: 'parallel',
          branches: [
            {
              name: 'Generating the Ansible Job component',
              actions: [
                {
                  name: 'Run Template Fetch Action',
                  functionRef: {
                    refName: 'runActionFetchTemplate',
                    arguments: {
                      id: '$WORKFLOW.instanceId',
                      url: 'https://github.com/janus-idp/software-templates/tree/main/templates/github/launch-ansible-job/skeleton',
                      values: {
                        name: '${.ansibleJobDefinition.name}',
                        jobTemplate: '${.ansibleJobDefinition.jobTemplate}',
                        component_id: '${.ansibleJobDefinition.name}',
                        namespace: '${.ansibleJobDefinition.namespace}',
                        // deepcode ignore HardcodedNonCryptoSecret: False positive
                        connection_secret:
                          '${.ansibleJobDefinition.connectionSecret}',
                        description: '${.ansibleJobDefinition.description}',
                        extra_vars: '${.ansibleJobDefinition.extraVars}',
                      },
                    },
                  },
                },
              ],
            },
            {
              name: 'Generating the Catalog Info Component',
              actions: [
                {
                  functionRef: {
                    refName: 'runActionFetchTemplate',
                    arguments: {
                      id: '$WORKFLOW.instanceId',
                      url: 'https://github.com/janus-idp/software-templates/tree/main/skeletons/catalog-info',
                      values: {
                        githubOrg: '${.repositoryInfo.githubOrg}',
                        repoName: '${.repositoryInfo.repoName}',
                        owner: '${.repositoryInfo.owner}',
                        applicationType: 'api',
                        description: '${.ansibleJobDefinition.description}',
                      },
                    },
                  },
                },
              ],
            },
          ],
          onErrors: [
            {
              errorRef: 'Error on Action',
              transition: 'Handle Error',
            },
          ],
          compensatedBy: 'Clear Code and Catalog generation',
          transition: 'Publishing to the Source Code Repository',
        },
        {
          name: 'Publishing to the Source Code Repository',
          type: 'operation',
          actionMode: 'sequential',
          actions: [
            {
              name: 'Publish Github',
              functionRef: {
                refName: 'runActionGitHubRepoPush',
                arguments: {
                  id: '$WORKFLOW.instanceId',
                  title: '.ansibleJobDefinition.name + "-job"',
                  description: 'Workflow Action',
                  repoUrl:
                    '"github.com?owner=" + .repositoryInfo.githubOrg + "&repo=" + .repositoryInfo.repoName',
                  defaultBranch: 'main',
                  gitCommitMessage: 'Initial commit',
                  protectDefaultBranch: false,
                  protectEnforceAdmins: false,
                },
              },
              actionDataFilter: {
                results: '.actionPublishResult',
              },
            },
          ],
          onErrors: [
            {
              errorRef: 'Error on Action',
              transition: 'Handle Error',
            },
          ],
          compensatedBy: 'Remove Source Code Repository',
          transition: 'Registering the Catalog Info Component',
        },
        {
          name: 'Registering the Catalog Info Component',
          type: 'operation',
          actionMode: 'sequential',
          actions: [
            {
              name: 'Catalog Register Action',
              functionRef: {
                refName: 'runActionCatalogRegister',
                arguments: {
                  id: '$WORKFLOW.instanceId',
                  repoContentsUrl: '.actionPublishResult.repoContentsUrl',
                  catalogInfoPath: '"/catalog-info.yaml"',
                },
              },
              actionDataFilter: {
                toStateData: '.actionCatalogRegisterResult',
              },
            },
          ],
          onErrors: [
            {
              errorRef: 'Error on Action',
              transition: 'Handle Error',
            },
          ],
          compensatedBy: 'Remove Catalog Info Component',
          end: true,
        },
        {
          name: 'Clear Code and Catalog generation',
          type: 'operation',
          usedForCompensation: true,
          actions: [
            {
              name: 'Clear FS Action',
              functionRef: {
                refName: 'fs:delete',
                arguments: {
                  files: ['./'],
                },
              },
            },
          ],
        },
        {
          name: 'Remove Source Code Repository',
          type: 'operation',
          usedForCompensation: true,
          actions: [
            {
              name: 'Remove Source Code Repository',
              functionRef: {
                refName: 'sysout',
                arguments: {
                  message: 'Remove Source Code Repository',
                },
              },
            },
          ],
        },
        {
          name: 'Remove Catalog Info Component',
          type: 'operation',
          usedForCompensation: true,
          actions: [
            {
              name: 'Remove Catalog Info Component',
              functionRef: {
                refName: 'sysout',
                arguments: {
                  message: 'Remove Catalog Info Component',
                },
              },
            },
          ],
        },
        {
          name: 'Handle Error',
          type: 'operation',
          actions: [
            {
              name: 'Error Action',
              functionRef: {
                refName: 'sysout',
                arguments: {
                  message: 'Error on workflow, triggering compensations',
                },
              },
            },
          ],
          end: {
            compensate: true,
          },
        },
      ],
    },
    isComposedSchema: true,
    schemaSteps: [
      {
        title: 'Provide information about the GitHub location',
        key: 'repositoryInfo',
        schema: {
          $id: 'classpath:/schemas/ansible-job-template__ref-schema__GitHub_Repository_Info.json',
          title: 'Provide information about the GitHub location',
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            githubOrg: {
              title: 'Organization Name',
              description: 'GitHub organization name',
              type: 'string',
            },
            owner: {
              title: 'Owner',
              description: 'An entity from the catalog',
              type: 'string',
            },
            repoName: {
              title: 'Repository Name',
              description: 'GitHub repository name',
              type: 'string',
            },
            system: {
              title: 'System',
              description: 'An entity from the catalog',
              type: 'string',
              default: 'system:janus-idp',
            },
          },
          required: ['githubOrg', 'owner', 'repoName', 'system'],
        },
        data: {},
        readonlyKeys: [],
      },
      {
        title: 'Ansible Job Definition',
        key: 'ansibleJobDefinition',
        schema: {
          $id: 'classpath:/schemas/ansible-job-template__ref-schema__Ansible_Job_Definition.json',
          title: 'Ansible Job Definition',
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            name: {
              title: 'Name of the Ansible Job',
              description: 'A unique name for the Ansible Job',
              type: 'string',
            },
            jobTemplate: {
              title: 'Name of the Job Template to launch',
              description: 'Specify a job template to launch',
              type: 'string',
            },
            description: {
              title: 'Description',
              description: 'Provide a description of the Job to be launched',
              type: 'string',
            },
            namespace: {
              title: 'Namespace',
              description: 'Specify the namespace to launch the job',
              type: 'string',
              default: 'aap',
            },
            connectionSecret: {
              title: 'Connection Secret',
              description: 'Specify the connection secret to use for the job',
              type: 'string',
              default: 'aapaccess',
            },
            extraVars: {
              title: 'Extra Vars',
              description: 'Specify any extra vars to pass to the job',
              type: 'string',
              default: '{}',
            },
          },
          required: [
            'name',
            'jobTemplate',
            'description',
            'namespace',
            'connectionSecret',
          ],
        },
        data: {},
        readonlyKeys: [],
      },
    ],
  };
