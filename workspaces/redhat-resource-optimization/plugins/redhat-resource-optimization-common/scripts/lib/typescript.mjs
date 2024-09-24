/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
