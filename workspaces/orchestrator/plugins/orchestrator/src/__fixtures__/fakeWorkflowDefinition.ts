import { WorkflowDefinition } from '@janus-idp/backstage-plugin-orchestrator-common';

export const fakeWorkflowDefinition: WorkflowDefinition = {
  id: 'quarkus-backend-workflow-ci-switch',
  version: '1.0',
  specVersion: '0.8',
  name: '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  description:
    '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  functions: [
    {
      name: 'runActionTemplateFetch',
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
            refName: 'runActionTemplateFetch',
            arguments: {
              url: 'https://github.com/janus-idp/software-templates/tree/main/templates/github/quarkus-backend/skeleton',
              values: {
                githubOrg: '.githubOrg',
                repoName: '.repoName',
                owner: '.owner',
                system: '.system',
                applicationType: 'api',
                description: '.description',
                namespace: '.namespace',
                imageUrl: 'imageUrl',
                imageBuilder: '.imageBuilder',
                imageRepository: '.imageRepository',
                port: '.port',
                ci: '.ci',
                groupId: '.groupId',
                artifactId: '.artifactId',
                javaPackageName: '.javaPackageName',
              },
            },
          },
          actionDataFilter: {
            toStateData: '.actionFetchTemplateSourceCodeResult',
          },
        },
      ],
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
            refName: 'runActionTemplateFetch',
            arguments: {
              url: 'https://github.com/janus-idp/software-templates/tree/main/skeletons/github-actions',
              copyWithoutTemplating: ['".github/workflows/"'],
              values: {
                githubOrg: '.githubOrg',
                repoName: '.repoName',
                owner: '.owner',
                system: '.system',
                applicationType: 'api',
                description: '.description',
                namespace: '.namespace',
                imageUrl: 'imageUrl',
                imageBuilder: '.imageBuilder',
                imageRepository: '.imageRepository',
                port: '.port',
                ci: '.ci',
                groupId: '.groupId',
                artifactId: '.artifactId',
                javaPackageName: '.javaPackageName',
              },
            },
          },
          actionDataFilter: {
            toStateData: '.actionTemplateFetchCIResult',
          },
        },
      ],
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
            refName: 'runActionTemplateFetch',
            arguments: {
              url: 'https://github.com/janus-idp/software-templates/tree/main/skeletons/tekton',
              copyWithoutTemplating: ['".tekton/workflows/"'],
              values: {
                githubOrg: '.githubOrg',
                repoName: '.repoName',
                owner: '.owner',
                system: '.system',
                applicationType: 'api',
                description: '.description',
                namespace: '.namespace',
                imageUrl: 'imageUrl',
                imageBuilder: '.imageBuilder',
                imageRepository: '.imageRepository',
                port: '.port',
                ci: '.ci',
                groupId: '.groupId',
                artifactId: '.artifactId',
                javaPackageName: '.javaPackageName',
              },
            },
          },
          actionDataFilter: {
            toStateData: '.actionTemplateFetchCIResult',
          },
        },
      ],
      transition: 'Generating the Catalog Info Component',
    },
    {
      name: 'Generating the Catalog Info Component',
      type: 'operation',
      actions: [
        {
          name: 'Fetch Template Action - Catalog Info',
          functionRef: {
            refName: 'runActionTemplateFetch',
            arguments: {
              url: 'https://github.com/janus-idp/software-templates/tree/main/skeletons/catalog-info',
              values: {
                githubOrg: '.githubOrg',
                repoName: '.repoName',
                owner: '.owner',
                system: '.system',
                applicationType: 'api',
                description: '.description',
                namespace: '.namespace',
                imageUrl: 'imageUrl',
                imageBuilder: '.imageBuilder',
                imageRepository: '.imageRepository',
                port: '.port',
                ci: '.ci',
                groupId: '.groupId',
                artifactId: '.artifactId',
                javaPackageName: '.javaPackageName',
              },
            },
          },
          actionDataFilter: {
            toStateData: '.actionFetchTemplateCatalogInfoResult',
          },
        },
      ],
      transition: 'Publishing to the Source Code Repository',
    },
    {
      name: 'Publishing to the Source Code Repository',
      type: 'operation',
      actionMode: 'sequential',
      actions: [
        {
          name: 'Publish Github Action',
          functionRef: {
            refName: 'runActionPublishGithub',
            arguments: {
              allowedHosts: ['"github.com"'],
              description: 'Workflow Action',
              repoUrl:
                '"github.com?owner=" + .githubOrg + "&repo=" + .repoName',
              defaultBranch: '.defaultBranch',
              gitCommitMessage: '.gitCommitMessage',
              allowAutoMerge: true,
              allowRebaseMerge: true,
            },
          },
          actionDataFilter: {
            toStateData: '.actionPublishResult',
          },
        },
      ],
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
      end: true,
    },
  ],
  dataInputSchema:
    'schemas/quarkus-backend-workflow-ci-switch__main_schema.json',
  annotations: ['workflow-type/ci'],
};
