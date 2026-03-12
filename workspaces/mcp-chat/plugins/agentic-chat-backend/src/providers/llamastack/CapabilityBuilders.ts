/*
 * Copyright 2025 The Backstage Authors
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

/**
 * Standalone factory functions that assemble the four provider capabilities
 * (conversations, RAG, safety, evaluation) from their backing services.
 *
 * Extracted from LlamaStackProvider to keep the provider class focused on
 * lifecycle, chat orchestration, and model testing.
 */

import type {
  ConversationCapability,
  RAGCapability,
  SafetyCapability,
  EvaluationCapability,
  ConversationListResult,
  ConversationDetails,
  InputItemsResult,
  ConversationItemsResult,
  ProcessedMessage,
  ToolApproval,
  ApprovalResult,
  SafetyStatus,
  SafetyCheckResult,
  EvalStatus,
  DocumentInfo,
  VectorStoreInfo,
  EvaluationResult,
} from '../types';
import type { SyncResult } from '@backstage-community/plugin-agentic-chat-common';
import type { ConversationFacade } from './ConversationFacade';
import type { VectorStoreFacade } from './VectorStoreFacade';
import type { SafetyService } from './SafetyService';
import type { EvaluationService } from './EvaluationService';

export function buildConversationsCapability(
  facade: ConversationFacade,
): ConversationCapability {
  return {
    create: async () => {
      const conversationId = await facade.createConversation();
      return { conversationId };
    },

    list: async (
      limit?: number,
      after?: string,
    ): Promise<ConversationListResult> => {
      return facade.listConversations(limit, 'desc', after);
    },

    get: async (responseId: string): Promise<ConversationDetails> => {
      const details = await facade.getConversation(responseId);
      if (!details) {
        throw new Error(`Conversation not found: ${responseId}`);
      }
      return details;
    },

    getInputs: async (responseId: string): Promise<InputItemsResult> => {
      return facade.getConversationInputs(responseId);
    },

    getByResponseChain: async (
      responseId: string,
    ): Promise<ConversationItemsResult> => {
      const items = await facade.walkResponseChain(responseId);
      return {
        items: items.map(item => ({
          type: 'message',
          role: item.role,
          content: item.text,
        })),
      };
    },

    getProcessedMessages: async (
      conversationId: string,
    ): Promise<ProcessedMessage[]> => {
      return facade.getProcessedMessages(conversationId);
    },

    delete: async (responseId: string): Promise<void> => {
      await facade.deleteConversation(responseId);
    },

    submitApproval: async (approval: ToolApproval): Promise<ApprovalResult> => {
      return facade.continueAfterApproval(
        approval.responseId,
        approval.callId,
        approval.approved,
        approval.toolName,
        approval.toolArguments,
      );
    },
  };
}

export function buildRagCapability(facade: VectorStoreFacade): RAGCapability {
  return {
    listDocuments: async (vectorStoreId?: string): Promise<DocumentInfo[]> => {
      return facade.listDocuments(vectorStoreId);
    },

    listVectorStores: async (): Promise<VectorStoreInfo[]> => {
      return facade.listVectorStores();
    },

    getDefaultVectorStoreId: (): string | undefined => {
      return facade.getDefaultVectorStoreId();
    },

    getActiveVectorStoreIds: async (): Promise<string[]> => {
      return facade.getActiveVectorStoreIds();
    },

    syncDocuments: async (): Promise<SyncResult> => {
      return facade.syncDocuments();
    },

    uploadDocument: async (
      fileName: string,
      content: Buffer,
      vectorStoreId?: string,
    ): Promise<{ fileId: string; fileName: string; status: string }> => {
      return facade.uploadDocument(fileName, content, vectorStoreId);
    },

    deleteDocument: async (
      fileId: string,
      vectorStoreId?: string,
    ): Promise<{ success: boolean }> => {
      return facade.deleteDocument(fileId, vectorStoreId);
    },

    searchVectorStore: async (
      query: string,
      maxResults?: number,
      vectorStoreId?: string,
      vectorStoreIds?: string[],
    ): Promise<{
      query: string;
      chunks: Array<{
        text: string;
        score?: number;
        fileId?: string;
        fileName?: string;
        vectorStoreId?: string;
      }>;
      vectorStoreId: string;
      totalResults: number;
    }> => {
      return facade.searchVectorStore(
        query,
        maxResults,
        vectorStoreId,
        vectorStoreIds,
      );
    },

    getVectorStoreConfig: async () => {
      return facade.getVectorStoreConfig();
    },

    createVectorStoreWithConfig: async (overrides: Record<string, unknown>) => {
      return facade.createVectorStoreWithConfig(overrides);
    },

    getVectorStoreStatus: async () => {
      return facade.getVectorStoreStatus();
    },

    addVectorStoreId: (id: string) => {
      facade.addVectorStoreId(id);
    },

    removeVectorStoreId: (id: string) => {
      facade.removeVectorStoreId(id);
    },

    deleteVectorStore: (vectorStoreId: string) => {
      return facade.deleteVectorStore(vectorStoreId);
    },
  };
}

export function buildSafetyCapability(
  safetyService: SafetyService,
): SafetyCapability {
  return {
    isEnabled: (): boolean => {
      return safetyService.isEnabled();
    },

    getStatus: async (): Promise<SafetyStatus> => {
      return {
        enabled: safetyService.isEnabled(),
        shields: safetyService.getAvailableShields().map(s => s.identifier),
      };
    },

    checkInput: async (text: string): Promise<SafetyCheckResult> => {
      const violation = await safetyService.checkInput(text);
      if (violation) {
        return {
          safe: false,
          violation: violation.user_message,
          category: violation.violation_level,
        };
      }
      return { safe: true };
    },

    checkOutput: async (text: string): Promise<SafetyCheckResult> => {
      const violation = await safetyService.checkOutput(text);
      if (violation) {
        return {
          safe: false,
          violation: violation.user_message,
          category: violation.violation_level,
        };
      }
      return { safe: true };
    },
  };
}

export function buildEvaluationCapability(
  evaluationService: EvaluationService,
): EvaluationCapability {
  return {
    isEnabled: (): boolean => {
      return evaluationService.isEnabled();
    },

    getStatus: async (): Promise<EvalStatus> => {
      return {
        enabled: evaluationService.isEnabled(),
        scoringFunctions: evaluationService
          .getAvailableScoringFunctions()
          .map(f => f.identifier),
      };
    },

    evaluateResponse: async (
      userMessage: string,
      assistantResponse: string,
      context?: string[],
    ): Promise<EvaluationResult> => {
      const result = await evaluationService.scoreResponse(
        userMessage,
        assistantResponse,
        context,
      );
      if (!result) {
        return {
          overallScore: 0,
          scores: {},
          passedThreshold: true,
          qualityLevel: 'poor',
          evaluatedAt: new Date().toISOString(),
          skipped: true,
        };
      }
      return result;
    },
  };
}
