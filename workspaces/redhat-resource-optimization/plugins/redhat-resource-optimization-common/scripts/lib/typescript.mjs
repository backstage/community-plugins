import { Project, ts } from 'ts-morph';

/**
 * @see https://ts-morph.com/details/documentation
 */
export class SourceFileMutator {
  #project;

  constructor(tsConfigFilePath) {
    this.#project = new Project({
      tsConfigFilePath,
      skipAddingFilesFromTsConfig: true,
    });
  }

  addJsDocPublicTagsToGeneratedModels(fileGlobs) {
    const sourceFiles = this.#project.addSourceFilesAtPaths(fileGlobs);
    for (const sourceFile of sourceFiles) {
      const interfaceDeclaration = sourceFile.getInterface(() => true); // return the only interface declaration
      interfaceDeclaration.addJsDoc(
        SourceFileMutator.makeSimpleJsDocPublicTag(),
      );
    }
  }

  addJsDocPublicTagsToPluginId(fileGlobs) {
    const sourceFile = this.#project.addSourceFileAtPath(fileGlobs);
    const variableStatement = sourceFile.getVariableStatement('pluginId');
    variableStatement.addJsDoc(SourceFileMutator.makeSimpleJsDocPublicTag());
  }

  addJsDocPublicTagToDefaultApiClient(fileGlobs) {
    const sourceFile = this.#project.addSourceFileAtPath(fileGlobs);
    const [jsdoc] = sourceFile.getClass('DefaultApiClient').getJsDocs();
    jsdoc.addTag(SourceFileMutator.makeSimpleJsDocPublicTag().tags[0]);
  }

  addMissingHyphenToTsDocParamTags(fileGlobs) {
    const sourceFile = this.#project.addSourceFileAtPath(fileGlobs);
    const classDeclaration = sourceFile.getClass('DefaultApiClient');
    const methodDeclarations = classDeclaration.getMethods();
    for (const method of methodDeclarations) {
      const jsDocs = method.getJsDocs();
      for (const jsDoc of jsDocs) {
        const paramsTags = jsDoc
          .getTags()
          .filter(tag => tag.getTagName() === 'param');
        for (const paramTag of paramsTags) {
          const currentCommentText = paramTag.getCommentText();
          if (currentCommentText && !currentCommentText.startsWith('-')) {
            const paramName = paramTag.getName();
            paramTag.replaceWithText(
              `@param ${paramName} - ${currentCommentText}`,
            );
          }
        }
      }
    }
  }

  writeFilesSync() {
    this.#project.saveSync();
  }

  static makeSimpleJsDocPublicTag() {
    return {
      tags: [{ tagName: 'public', kind: ts.SyntaxKind.JSDocPublicTag }],
    };
  }
}
