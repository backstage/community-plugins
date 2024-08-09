import {
  FileLanguage,
  getFileLanguageOrThrow,
} from '@kie-tools/serverless-workflow-language-service/dist/api';
import {
  SwfJsonLanguageService,
  SwfLanguageServiceArgs,
  SwfYamlLanguageService,
} from '@kie-tools/serverless-workflow-language-service/dist/channel';
import { SwfServiceCatalogService } from '@kie-tools/serverless-workflow-service-catalog/dist/api';

export class WorkflowEditorLanguageService {
  constructor(private readonly services: SwfServiceCatalogService[] = []) {}
  public getLs(
    relativePath: string,
  ): SwfJsonLanguageService | SwfYamlLanguageService {
    const lsArgs = this.getDefaultLsArgs({});

    const fileLanguage = getFileLanguageOrThrow(relativePath);
    if (fileLanguage === FileLanguage.YAML) {
      return new SwfYamlLanguageService(lsArgs);
    } else if (fileLanguage === FileLanguage.JSON) {
      return new SwfJsonLanguageService(lsArgs);
    }
    throw new Error(`Could not determine LS for ${relativePath}`);
  }

  private getDefaultLsArgs(
    configOverrides: Partial<SwfLanguageServiceArgs['config']>,
  ): Omit<SwfLanguageServiceArgs, 'lang'> {
    return {
      fs: {},
      serviceCatalog: {
        global: {
          getServices: async () => [],
        },
        relative: {
          getServices: async _textDocument => this.services,
        },
        getServiceFileNameFromSwfServiceCatalogServiceId: async (
          registryName: string,
          serviceCatalogServiceId: string,
        ) => `${registryName}__${serviceCatalogServiceId}__latest.yaml`,
      },
      config: {
        shouldDisplayServiceRegistriesIntegration: async () => false,
        shouldIncludeJsonSchemaDiagnostics: async () => true,
        shouldReferenceServiceRegistryFunctionsWithUrls: async () => true,
        getSpecsDirPosixPaths: async _textDocument => ({
          specsDirRelativePosixPath: 'specs',
          specsDirAbsolutePosixPath: 'specs',
        }),
        getRoutesDirPosixPaths: async _textDocument => ({
          routesDirRelativePosixPath: '',
          routesDirAbsolutePosixPath: '',
        }),
        shouldConfigureServiceRegistries: () => false,
        shouldServiceRegistriesLogIn: () => false,
        canRefreshServices: () => false,
        ...configOverrides,
      },
      jqCompletions: {
        remote: {
          getJqAutocompleteProperties: (_args: any) => Promise.resolve([]),
        },
        relative: {
          getJqAutocompleteProperties: (_args: any) => Promise.resolve([]),
        },
      },
    };
  }
}
