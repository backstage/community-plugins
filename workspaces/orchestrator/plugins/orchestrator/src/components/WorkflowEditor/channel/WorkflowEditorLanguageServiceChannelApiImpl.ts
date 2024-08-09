import { SwfLanguageServiceChannelApi } from '@kie-tools/serverless-workflow-language-service/dist/api';
import {
  SwfJsonLanguageService,
  SwfYamlLanguageService,
} from '@kie-tools/serverless-workflow-language-service/dist/channel';
import {
  CodeLens,
  CompletionItem,
  Position,
  Range,
} from 'vscode-languageserver-types';

export class WorkflowEditorLanguageServiceChannelApiImpl
  implements SwfLanguageServiceChannelApi
{
  constructor(
    private readonly ls: SwfJsonLanguageService | SwfYamlLanguageService,
  ) {}

  public async kogitoSwfLanguageService__getCompletionItems(args: {
    content: string;
    uri: string;
    cursorPosition: Position;
    cursorWordRange: Range;
  }): Promise<CompletionItem[]> {
    return this.ls.getCompletionItems(args);
  }

  public async kogitoSwfLanguageService__getCodeLenses(args: {
    uri: string;
    content: string;
  }): Promise<CodeLens[]> {
    return this.ls.getCodeLenses(args);
  }
}
