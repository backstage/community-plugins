import { initCustom } from '@kie-tools-core/editor/dist/envelope';
import { NoOpKeyboardShortcutsService } from '@kie-tools-core/keyboard-shortcuts/dist/envelope';
import {
  ServerlessWorkflowCombinedEditorApi,
  ServerlessWorkflowCombinedEditorChannelApi,
} from '@kie-tools/serverless-workflow-combined-editor/dist/api';
import { ServerlessWorkflowCombinedEditorEnvelopeApi } from '@kie-tools/serverless-workflow-combined-editor/dist/api/ServerlessWorkflowCombinedEditorEnvelopeApi';
import { ServerlessWorkflowCombinedEditorFactory } from '@kie-tools/serverless-workflow-combined-editor/dist/editor';
import { ServerlessWorkflowCombinedEditorEnvelopeApiImpl } from '@kie-tools/serverless-workflow-combined-editor/dist/envelope';

initCustom<
  ServerlessWorkflowCombinedEditorApi,
  ServerlessWorkflowCombinedEditorEnvelopeApi,
  ServerlessWorkflowCombinedEditorChannelApi
>({
  container: document.getElementById('root')!,
  bus: {
    postMessage: (message, targetOrigin: string, _) =>
      window.parent.postMessage(message, targetOrigin, _),
  },
  apiImplFactory: {
    create: args =>
      new ServerlessWorkflowCombinedEditorEnvelopeApiImpl(
        args,
        new ServerlessWorkflowCombinedEditorFactory(),
      ),
  },
  keyboardShortcutsService: new NoOpKeyboardShortcutsService(),
});
