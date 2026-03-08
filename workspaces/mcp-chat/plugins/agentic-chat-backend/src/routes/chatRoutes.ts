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
import type { LoggerService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import type { Response } from 'express';
import type { NormalizedStreamEvent } from '../providers';
import type { ChatMessage } from '../types';
import type { SafetyChatResponse, EvaluatedChatResponse } from '../types';
import { createWithRoute } from './routeWrapper';
import type { FlushableResponse, RouteContext } from './types';

function getLastUserContent(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      return messages[i].content || '';
    }
  }
  return '';
}

function buildSafetyResponse(
  violation: string | undefined,
  filterReason: 'input_violation' | 'output_violation',
): SafetyChatResponse {
  const defaultMessages: Record<string, string> = {
    input_violation:
      'I cannot process this request as it may violate safety guidelines.',
    output_violation:
      'The AI response was filtered because it may violate safety guidelines.',
  };
  return {
    role: 'assistant',
    content: violation || defaultMessages[filterReason],
    filtered: true,
    filterReason,
  };
}

function setupSseStream(
  res: Response,
  logger: LoggerService,
): {
  abortController: AbortController;
  clientDisconnectedRef: { current: boolean };
} {
  res.setHeader('Content-Encoding', 'identity');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientDisconnectedRef = { current: false };
  const abortController = new AbortController();
  res.on('close', () => {
    clientDisconnectedRef.current = true;
    abortController.abort();
    logger.info('Client disconnected from stream');
  });
  return { abortController, clientDisconnectedRef };
}

function createStreamEventForwarder(
  res: Response,
  clientDisconnectedRef: { current: boolean },
  logger: LoggerService,
): {
  forward: (event: NormalizedStreamEvent) => void;
  streamedTextRef: { current: string };
  streamModelRef: { current: string | undefined };
} {
  const streamedTextRef = { current: '' };
  const streamModelRef = { current: undefined as string | undefined };

  const forward = (event: NormalizedStreamEvent) => {
    if (event.type === 'stream.started') {
      streamModelRef.current = (event as { model?: string }).model;
    } else if (event.type === 'stream.text.delta' && event.delta) {
      streamedTextRef.current += event.delta;
    } else if (event.type === 'stream.completed' && event.usage) {
      const u = event.usage;
      if (u.output_tokens === 0 && !streamedTextRef.current) {
        logger.warn(
          `Model "${
            streamModelRef.current ?? 'unknown'
          }" returned 0 output tokens (input=${
            u.input_tokens
          }). The model may not support the Responses API or the request format.`,
        );
      } else {
        logger.info(
          `Token usage: input=${u.input_tokens}, output=${u.output_tokens}, total=${u.total_tokens}`,
        );
      }
    } else if (event.type === 'stream.error') {
      logger.warn(`Stream error: ${event.error}`);
    } else if (event.type === 'stream.tool.approval') {
      logger.info(
        `HITL: Tool approval required for "${event.name}" - waiting for user decision`,
      );
    }

    if (!clientDisconnectedRef.current) {
      const payload = `data: ${JSON.stringify(event)}\n\n`;
      const canContinue = res.write(payload);
      const flushableRes = res as FlushableResponse;
      if (flushableRes.flush) {
        flushableRes.flush();
      }
      if (!canContinue) {
        res.once('drain', () => {
          /* backpressure relieved */
        });
      }
    }
  };

  return { forward, streamedTextRef, streamModelRef };
}

function handleStreamErrorAndCleanup(
  res: Response,
  clientDisconnectedRef: { current: boolean },
  error: unknown,
  toErrorMessage: (e: unknown) => string,
  logger: LoggerService,
): void {
  const msg = toErrorMessage(error);
  logger.error(`Streaming error: ${msg}`);
  if (!clientDisconnectedRef.current) {
    const errorEvent: NormalizedStreamEvent = {
      type: 'stream.error',
      error: msg,
      code: 'stream_error',
    };
    res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
    res.end();
  }
}

/**
 * Registers chat, streaming, and human-in-the-loop approval endpoints.
 */
export function registerChatRoutes(ctx: RouteContext): void {
  const {
    router,
    logger,
    provider,
    sessions,
    sendRouteError,
    toErrorMessage,
    parseChatRequest,
    parseApprovalRequest,
    getUserRef,
  } = ctx;

  const withRoute = createWithRoute(logger, sendRouteError);

  router.post(
    '/chat',
    withRoute(
      'POST /chat',
      'Failed to process chat message',
      async (req, res) => {
        const parsed = parseChatRequest(req.body);
        const { messages, enableRAG, previousResponseId, conversationId } =
          parsed;

        await provider.refreshDynamicConfig?.();

        const userContent = getLastUserContent(messages);

        if (provider.safety?.isEnabled()) {
          const safetyResult = await provider.safety.checkInput(userContent);
          if (!safetyResult.safe) {
            logger.warn(`Input blocked by safety: ${safetyResult.violation}`);
            res.json(
              buildSafetyResponse(safetyResult.violation, 'input_violation'),
            );
            return;
          }
        }

        const response = await provider.chat({
          messages,
          enableRAG,
          previousResponseId,
          conversationId,
        });

        if (provider.safety?.isEnabled()) {
          const outputResult = await provider.safety.checkOutput(
            response.content,
          );
          if (!outputResult.safe) {
            logger.warn(`Output blocked by safety: ${outputResult.violation}`);
            res.json(
              buildSafetyResponse(outputResult.violation, 'output_violation'),
            );
            return;
          }
        }

        if (provider.evaluation?.isEnabled()) {
          const evaluation = await provider.evaluation.evaluateResponse(
            userContent,
            response.content,
            response.ragContext,
          );

          if (evaluation) {
            const evaluatedResponse: EvaluatedChatResponse = {
              ...response,
              evaluation,
            };
            if (!evaluation.passedThreshold) {
              logger.warn(
                `Response scored below threshold: ${evaluation.overallScore.toFixed(
                  2,
                )} (${evaluation.qualityLevel})`,
              );
            }
            res.json(evaluatedResponse);
            return;
          }
        }

        res.json(response);
      },
    ),
  );

  router.post('/chat/stream', async (req, res) => {
    logger.info('POST /chat/stream - Starting streaming response');

    let parsedRequest: ReturnType<typeof parseChatRequest>;
    try {
      parsedRequest = parseChatRequest(req.body);
    } catch (parseError) {
      sendRouteError(
        res,
        parseError,
        'Invalid stream request',
        'Invalid stream request',
      );
      return;
    }
    const {
      messages,
      enableRAG,
      previousResponseId,
      conversationId,
      sessionId,
    } = parsedRequest;

    const { abortController, clientDisconnectedRef } = setupSseStream(
      res,
      logger,
    );
    const { forward, streamedTextRef } = createStreamEventForwarder(
      res,
      clientDisconnectedRef,
      logger,
    );

    try {
      await provider.refreshDynamicConfig?.();

      const userRef = await getUserRef(req);

      let resolvedConversationId = conversationId;
      if (sessionId && sessions) {
        const session = await sessions.getSession(sessionId, userRef);
        if (!session) {
          throw new InputError(`Session ${sessionId} not found`);
        }
        if (session.conversationId) {
          resolvedConversationId = session.conversationId;
        } else if (provider.conversations) {
          try {
            const { conversationId: newConvId } =
              await provider.conversations.create();
            await sessions.setConversationId(sessionId, userRef, newConvId);
            resolvedConversationId = newConvId;
            logger.info(
              `Created conversation ${newConvId} for session ${sessionId}`,
            );
          } catch (convErr) {
            logger.warn(
              `Could not create LlamaStack conversation for session ${sessionId}, continuing without: ${convErr}`,
            );
          }
        }
      }

      if (provider.safety?.isEnabled()) {
        const userContent = getLastUserContent(messages);
        const safetyResult = await provider.safety.checkInput(userContent);
        if (!safetyResult.safe) {
          const errorEvent: NormalizedStreamEvent = {
            type: 'stream.error',
            error:
              safetyResult.violation || 'Input blocked by safety guardrails',
            code: 'safety_violation',
          };
          res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
          res.end();
          return;
        }
      }

      let eventCount = 0;
      const wrappedForward = (event: NormalizedStreamEvent) => {
        eventCount++;
        forward(event);
      };

      await provider.chatStream(
        {
          messages,
          enableRAG,
          previousResponseId,
          conversationId: resolvedConversationId,
        },
        wrappedForward,
        abortController.signal,
      );

      logger.debug(`Stream completed with ${eventCount} events`);

      if (
        streamedTextRef.current &&
        provider.safety?.isEnabled() &&
        !clientDisconnectedRef.current
      ) {
        const outputResult = await provider.safety.checkOutput(
          streamedTextRef.current,
        );
        if (!outputResult.safe) {
          logger.warn(
            `Streamed output blocked by safety: ${outputResult.violation}`,
          );
          const warningEvent: NormalizedStreamEvent = {
            type: 'stream.error',
            error:
              outputResult.violation ||
              'The AI response was filtered because it may violate safety guidelines.',
            code: 'output_safety_violation',
          };
          res.write(`data: ${JSON.stringify(warningEvent)}\n\n`);
        }
      }

      if (sessionId && sessions) {
        try {
          const lastUserContent = getLastUserContent(messages);
          if (lastUserContent) {
            const session = await sessions.getSession(sessionId, userRef);
            if (session && session.title.startsWith('Chat ')) {
              const autoTitle = lastUserContent.slice(0, 80) || session.title;
              await sessions.updateTitle(sessionId, userRef, autoTitle);
            }
          }
          await sessions.touch(sessionId, userRef);
        } catch (touchErr) {
          logger.warn(
            `Failed to update session ${sessionId} after stream: ${touchErr}`,
          );
        }
      }

      if (!clientDisconnectedRef.current) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (error) {
      handleStreamErrorAndCleanup(
        res,
        clientDisconnectedRef,
        error,
        toErrorMessage,
        logger,
      );
    }
  });

  router.post(
    '/chat/approve',
    withRoute(
      'POST /chat/approve',
      'Failed to process approval',
      async (req, res) => {
        const { responseId, callId, approved, toolName, toolArguments } =
          parseApprovalRequest(req.body);

        logger.info(
          `Processing ${
            approved ? 'approval' : 'rejection'
          } for responseId=${responseId}, callId=${callId}, tool=${toolName}`,
        );

        if (!provider.conversations) {
          res.status(501).json({
            success: false,
            error: 'Tool approval is not supported by the current provider',
          });
          return;
        }

        const result = await provider.conversations.submitApproval({
          responseId,
          callId,
          approved: approved === true,
          toolName,
          toolArguments,
        });

        res.json({
          success: true,
          rejected: !approved,
          content: result.content,
          responseId: result.responseId,
          toolExecuted: result.toolExecuted,
          toolOutput: result.toolOutput,
          pendingApproval: result.pendingApproval,
        });
      },
    ),
  );
}
