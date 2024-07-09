import { initCustom } from '@kie-tools-core/editor/dist/envelope';
import {
  ServerlessWorkflowDiagramEditorChannelApi,
  ServerlessWorkflowDiagramEditorEnvelopeApi,
} from '@kie-tools/serverless-workflow-diagram-editor-envelope/dist/api';
import {
  ServerlessWorkflowDiagramEditor,
  ServerlessWorkflowDiagramEditorEnvelopeApiImpl,
  ServerlessWorkflowDiagramEditorFactory,
} from '@kie-tools/serverless-workflow-diagram-editor-envelope/dist/envelope';

initCustom<
  ServerlessWorkflowDiagramEditor,
  ServerlessWorkflowDiagramEditorEnvelopeApi,
  ServerlessWorkflowDiagramEditorChannelApi
>({
  container: document.getElementById('root')!,
  bus: {
    postMessage: (message, targetOrigin: string, _) =>
      window.parent.postMessage(message, targetOrigin, _),
  },
  apiImplFactory: {
    create: args =>
      new ServerlessWorkflowDiagramEditorEnvelopeApiImpl(
        args,
        new ServerlessWorkflowDiagramEditorFactory({
          shouldLoadResourcesDynamically: true,
        }),
      ),
  },
});
