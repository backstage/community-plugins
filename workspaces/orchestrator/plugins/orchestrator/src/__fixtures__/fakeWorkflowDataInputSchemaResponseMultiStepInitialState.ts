import { WorkflowInputSchemaResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

export const fakeDataInputSchemaMultiStepInitialStateResponse: WorkflowInputSchemaResponse =
  {
    definition: {
      id: 'quarkus-backend',
      version: '1.0',
      specVersion: '0.8',
      name: 'Quarkus Backend application',
      description:
        'Create a starter Quarkus backend application with a CI pipeline',
      dataInputSchema: 'schemas/quarkus-backend__main-schema.json',
      functions: [
        {
          name: 'runActionFetchTemplate',
          operation: 'specs/actions-openapi.json#fetch:template',
        },
        {
          name: 'runActionPublishGithub',
          operation: 'specs/actions-openapi.json#publish:github',
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
      start: 'Generating the Source Code Component',
      states: [
        {
          name: 'Generating the Source Code Component',
          type: 'operation',
          actionMode: 'sequential',
          actions: [
            {
              name: 'Fetch Template Action - Source Code',
              functionRef: {
                refName: 'runActionFetchTemplate',
                arguments: {
                  url: 'https://github.com/janus-idp/software-templates/tree/main/templates/github/quarkus-backend/skeleton',
                  values: {
                    orgName: '.orgName',
                    repoName: '.repoName',
                    owner: '.owner',
                    system: '.system',
                    applicationType: 'api',
                    description: '.description',
                    namespace: '.namespace',
                    port: '.port',
                    ci: '.ci',
                    sourceControl: 'github.com',
                    groupId: '.groupId',
                    artifactId: '.artifactId',
                    javaPackageName: '.javaPackageName',
                    version: '.version',
                  },
                },
              },
              actionDataFilter: {
                toStateData: '.actionFetchTemplateSourceCodeResult',
              },
            },
          ],
          onErrors: [
            {
              errorRef: 'Error on Action',
              transition: 'Handle Error',
            },
          ],
          compensatedBy: 'Clear File System - Source Code',
          transition: 'Generating the CI Component',
        },
        {
          name: 'Generating the CI Component',
          type: 'switch',
          dataConditions: [
            {
              condition: '${ .ci == "github" }',
              transition: 'Generating the CI Component - GitHub',
            },
            {
              condition: '${ .ci == "tekton" }',
              transition: 'Generating the CI Component - Tekton',
            },
          ],
          defaultCondition: {
            transition: 'Generating the CI Component - GitHub',
          },
        },
        {
          name: 'Generating the CI Component - GitHub',
          type: 'operation',
          actionMode: 'sequential',
          actions: [
            {
              name: 'Run Template Fetch Action - CI - GitHub',
              functionRef: {
                refName: 'runActionFetchTemplate',
                arguments: {
                  url: 'https://github.com/janus-idp/software-templates/tree/main/skeletons/github-actions',
                  copyWithoutTemplating: ['".github/workflows/"'],
                  values: {
                    orgName: '.orgName',
                    repoName: '.repoName',
                    owner: '.owner',
                    system: '.system',
                    applicationType: 'api',
                    description: '.description',
                    namespace: '.namespace',
                    port: '.port',
                    ci: '.ci',
                    sourceControl: 'github.com',
                    groupId: '.groupId',
                    artifactId: '.artifactId',
                    javaPackageName: '.javaPackageName',
                    version: '.version',
                  },
                },
              },
              actionDataFilter: {
                toStateData: '.actionTemplateFetchCIResult',
              },
            },
          ],
          onErrors: [
            {
              errorRef: 'Error on Action',
              transition: 'Handle Error',
            },
          ],
          compensatedBy: 'Clear File System - CI',
          transition: 'Generating the Catalog Info Component',
        },
        {
          name: 'Generating the CI Component - Tekton',
          type: 'operation',
          actionMode: 'sequential',
          actions: [
            {
              name: 'Run Template Fetch Action - CI - Tekton',
              functionRef: {
                refName: 'runActionFetchTemplate',
                arguments: {
                  url: 'https://github.com/janus-idp/software-templates/tree/main/skeletons/tekton',
                  copyWithoutTemplating: ['".github/workflows/"'],
                  values: {
                    orgName: '.orgName',
                    repoName: '.repoName',
                    owner: '.owner',
                    system: '.system',
                    applicationType: 'api',
                    description: '.description',
                    namespace: '.namespace',
                    imageUrl: '.imageUrl',
                    imageRepository: '.imageRepository',
                    imageBuilder: 's2i-java',
                    port: '.port',
                    ci: '.ci',
                    sourceControl: 'github.com',
                    groupId: '.groupId',
                    artifactId: '.artifactId',
                    javaPackageName: '.javaPackageName',
                    version: '.version',
                  },
                },
              },
              actionDataFilter: {
                toStateData: '.actionTemplateFetchCIResult',
              },
            },
          ],
          onErrors: [
            {
              errorRef: 'Error on Action',
              transition: 'Handle Error',
            },
          ],
          compensatedBy: 'Clear File System - CI',
          transition: 'Generating the Catalog Info Component',
        },
        {
          name: 'Generating the Catalog Info Component',
          type: 'operation',
          actions: [
            {
              name: 'Fetch Template Action - Catalog Info',
              functionRef: {
                refName: 'runActionFetchTemplate',
                arguments: {
                  url: 'https://github.com/janus-idp/software-templates/tree/main/skeletons/catalog-info',
                  values: {
                    orgName: '.orgName',
                    repoName: '.repoName',
                    owner: '.owner',
                    system: '.system',
                    applicationType: 'api',
                    description: '.description',
                    namespace: '.namespace',
                    imageUrl: 'imageUrl',
                    imageRepository: '.imageRepository',
                    imageBuilder: 's2i-go',
                    port: '.port',
                    ci: '.ci',
                    sourceControl: 'github.com',
                    groupId: '.groupId',
                    artifactId: '.artifactId',
                    javaPackageName: '.javaPackageName',
                    version: '.version',
                  },
                },
              },
              actionDataFilter: {
                toStateData: '.actionFetchTemplateCatalogInfoResult',
              },
            },
          ],
          onErrors: [
            {
              errorRef: 'Error on Action',
              transition: 'Handle Error',
            },
          ],
          compensatedBy: 'Clear File System - Catalog',
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
                refName: 'runActionPublishGithub',
                arguments: {
                  allowedHosts: ['"github.com"'],
                  description: 'Workflow Action',
                  repoUrl:
                    '"github.com?owner=" + .orgName + "&repo=" + .repoName',
                  defaultBranch: 'main',
                  gitCommitMessage: 'Initial commit',
                  allowAutoMerge: true,
                  allowRebaseMerge: true,
                },
              },
              actionDataFilter: {
                toStateData: '.actionPublishResult',
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
        {
          name: 'Clear File System - Source Code',
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
          name: 'Clear File System - CI',
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
          name: 'Clear File System - Catalog',
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
      ],
    },
    schemaSteps: [
      {
        key: 'newcomponent',
        readonlyKeys: ['system'],
        title: 'Provide information about the new component',
        data: {
          system: 'system',
        },
        schema: {
          $id: 'classpath:/schemas/quarkus-backend__ref-schema__New_Component.json',
          title: 'Provide information about the new component',
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            orgName: {
              title: 'Organization Name',
              description: 'Organization name',
              type: 'string',
            },
            repoName: {
              title: 'Repository Name',
              description: 'Repository name',
              type: 'string',
            },
            description: {
              title: 'Description',
              description: 'Help others understand what this component is for',
              type: 'string',
            },
            owner: {
              title: 'Owner',
              description: 'An entity from the catalog',
              type: 'string',
            },
            system: {
              title: 'System',
              description: 'An entity from the catalog',
              type: 'string',
            },
            port: {
              title: 'Port',
              description: 'Override the port exposed for the application',
              type: 'number',
              default: 8080,
            },
          },
          required: ['orgName', 'repoName', 'owner', 'system', 'port'],
        },
      },
      {
        schema: {
          $id: 'classpath:/schemas/quarkus-backend__ref-schema__Java_Metadata.json',
          title: 'Provide information about the Java metadata',
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            groupId: {
              title: 'Group ID',
              description: 'Maven Group ID eg (io.janus)',
              type: 'string',
              default: 'io.janus',
            },
            artifactId: {
              title: 'Artifact ID',
              description: 'Maven Artifact ID',
              type: 'string',
              default: 'quarkusapp',
            },
            javaPackageName: {
              title: 'Java Package Namespace',
              description:
                'Name for the Java Package (ensure to use the / character as this is used for folder structure) should match Group ID and Artifact ID',
              type: 'string',
              default: 'io/janus/quarkusapp',
            },
            version: {
              title: 'Version',
              description: 'Maven Artifact Version',
              type: 'string',
              default: '1.0.0-SNAPSHOT',
            },
          },
          required: ['groupId', 'artifactId', 'javaPackageName', 'version'],
        },
        title: 'Provide information about the Java metadata',
        key: 'javametadata',
        data: {},
        readonlyKeys: [],
      },
      {
        schema: {
          $id: 'classpath:/schemas/quarkus-backend__ref-schema__CI_Method.json',
          title: 'Provide information about the CI method',
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            ci: {
              title: 'CI Method',
              type: 'string',
              default: 'github',
              oneOf: [
                {
                  const: 'github',
                  title: 'GitHub Action',
                },
                {
                  const: 'tekton',
                  title: 'Tekton',
                },
              ],
            },
          },
          allOf: [
            {
              if: {
                properties: {
                  ci: {
                    const: 'github',
                  },
                },
              },
            },
            {
              if: {
                properties: {
                  ci: {
                    const: 'tekton',
                  },
                },
              },
              then: {
                properties: {
                  imageRepository: {
                    title: 'Image Registry',
                    description: 'The registry to use',
                    type: 'string',
                    default: 'quay.io',
                    oneOf: [
                      {
                        const: 'quay.io',
                        title: 'Quay',
                      },
                      {
                        const:
                          'image-registry.openshift-image-registry.svc:5000',
                        title: 'Internal OpenShift Registry',
                      },
                    ],
                  },
                  imageUrl: {
                    title: 'Image URL',
                    description:
                      'The Quay.io or OpenShift Image URL <REGISTRY>/<IMAGE_URL>/<REPO_NAME>',
                    type: 'string',
                  },
                  namespace: {
                    title: 'Namespace',
                    description: 'The namespace for deploying resources',
                    type: 'string',
                  },
                },
                required: ['namespace', 'imageUrl', 'imageRepository'],
              },
            },
          ],
        },
        data: { ci: 'tekton' },
        key: 'ci',
        title: 'Ci',
        readonlyKeys: [],
      },
    ],
    isComposedSchema: true,
  };
