import { JSONSchema7 } from 'json-schema';

import { WorkflowDefinition } from '@janus-idp/backstage-plugin-orchestrator-common';

const schema = {
  $id: 'classpath:/schemas/spring-boot-backend__main-schema.json',
  title: 'Data input schema',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    newComponent: {
      $ref: '#/$defs/Provide information about the new component_0',
      type: 'object',
    },
    javaMetadata: {
      $ref: '#/$defs/Provide information about the Java metadata_1',
      type: 'object',
    },
    ciMethod: {
      $ref: '#/$defs/Provide information about the CI method_2',
      type: 'object',
    },
  },
  $defs: {
    'Provide information about the CI method_2': {
      $id: 'classpath:/schemas/spring-boot-backend__ref-schema__CI_Method.json',
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
                    const: 'image-registry.openshift-image-registry.svc:5000',
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
    'Provide information about the Java metadata_1': {
      $id: 'classpath:/schemas/spring-boot-backend__ref-schema__Java_Metadata.json',
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
          default: 'spring-boot-app',
        },
        javaPackageName: {
          title: 'Java Package Namespace',
          description:
            'Name for the Java Package (ensure to use the / character as this is used for folder structure) should match Group ID and Artifact ID',
          type: 'string',
          default: 'io/janus/spring-boot-app',
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
    'Provide information about the new component_0': {
      $id: 'classpath:/schemas/spring-boot-backend__ref-schema__New_Component.json',
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
} as JSONSchema7;

const workflowDefinition = {
  id: 'spring-boot-backend',
  version: '1.0',
  specVersion: '0.8',
  name: 'Spring Boot Backend application',
  description:
    'Create a starter Spring Boot backend application with a CI pipeline',
  dataInputSchema: 'schemas/spring-boot-backend__main-schema.json',
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
              url: 'https://github.com/janus-idp/software-templates/tree/main/templates/github/spring-boot-backend/skeleton',
              values: {
                orgName: '.newComponent.orgName',
                repoName: '.newComponent.repoName',
                owner: '.newComponent.owner',
                system: '.newComponent.system',
                applicationType: 'api',
                description: '.newComponent.description',
                namespace: '.ciMethod.namespace',
                port: '.newComponent.port',
                ci: '.ciMethod.ci',
                sourceControl: 'github.com',
                groupId: '.javaMetadata.groupId',
                artifactId: '.javaMetadata.artifactId',
                javaPackageName: '.javaMetadata.javaPackageName',
                version: '.javaMetadata.version',
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
          condition: '${ .ciMethod.ci == "github" }',
          transition: 'Generating the CI Component - GitHub',
        },
        {
          condition: '${ .ciMethod.ci == "tekton" }',
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
                orgName: '.newComponent.orgName',
                repoName: '.newComponent.repoName',
                owner: '.newComponent.owner',
                system: '.newComponent.system',
                applicationType: 'api',
                description: '.newComponent.description',
                namespace: '.ciMethod.namespace',
                port: '.newComponent.port',
                ci: '.ciMethod.ci',
                sourceControl: 'github.com',
                groupId: '.javaMetadata.groupId',
                artifactId: '.javaMetadata.artifactId',
                javaPackageName: '.javaMetadata.javaPackageName',
                version: '.javaMetadata.version',
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
                orgName: '.newComponent.orgName',
                repoName: '.newComponent.repoName',
                owner: '.newComponent.owner',
                system: '.newComponent.system',
                applicationType: 'api',
                description: '.newComponent.description',
                namespace: '.ciMethod.namespace',
                imageUrl: '.imageUrl',
                imageRepository: '.imageRepository',
                imageBuilder: 's2i-go',
                port: '.newComponent.port',
                ci: '.ciMethod.ci',
                sourceControl: 'github.com',
                groupId: '.javaMetadata.groupId',
                artifactId: '.javaMetadata.artifactId',
                javaPackageName: '.javaMetadata.javaPackageName',
                version: '.javaMetadata.version',
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
                orgName: '.newComponent.orgName',
                repoName: '.newComponent.repoName',
                owner: '.newComponent.owner',
                system: '.newComponent.system',
                applicationType: 'api',
                description: '.newComponent.description',
                namespace: '.ciMethod.namespace',
                imageUrl: '.ciMethod.imageUrl',
                imageRepository: '.ciMethod.imageRepository',
                imageBuilder: 's2i-go',
                port: '.newComponent.port',
                ci: '.ciMethod.ci',
                sourceControl: 'github.com',
                groupId: '.javaMetadata.groupId',
                artifactId: '.javaMetadata.artifactId',
                javaPackageName: '.javaMetadata.javaPackageName',
                version: '.javaMetadata.version',
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
                '"github.com?owner=" + .newComponent.orgName + "&repo=" + .newComponent.repoName',
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
} as WorkflowDefinition;

const mockData: {
  schema: JSONSchema7;
  workflowDefinition: WorkflowDefinition;
} = { schema, workflowDefinition };

export default mockData;
