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
import React from 'react';
import { Message, Feedback as FeedbackType } from '../types';
import { ChatMessage } from './ChatMessage';
import { Box, Chip, Button, TextField } from '@material-ui/core';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { ChatbotApi } from '../apis';
import { FeedbackButton, Feedback as FeedbackEnum } from './FeedbackButton';

interface ChatFeedbackProps {
  messages: Message[];
  feedback: { [key: number]: FeedbackType };
  setFeedback: React.Dispatch<
    React.SetStateAction<{ [key: number]: FeedbackType }>
  >;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatbotApi: ChatbotApi;
  botName?: string;
  botIcon?: string;
  fontSizes?: {
    messageText?: string;
    codeBlock?: string;
    inlineCode?: string;
    timestamp?: string;
  };
  executionPlanBuffer?: Record<string, string>;
  executionPlanHistory?: Record<string, string[]>;
  autoExpandExecutionPlans?: Set<string>;
  executionPlanLoading?: Set<string>;
  onMetadataSubmit?: (messageId: string, data: Record<string, any>) => void;
}

function ChatFeedback({
  messages,
  feedback,
  setFeedback,
  setMessages,
  chatbotApi,
  botName,
  botIcon,
  fontSizes,
  executionPlanBuffer,
  executionPlanHistory,
  autoExpandExecutionPlans,
  executionPlanLoading,
  onMetadataSubmit,
}: ChatFeedbackProps) {
  const alertApi = useApi(alertApiRef);

  function handleFeedback(index: number, type: FeedbackEnum) {
    const feedbackType = type === FeedbackEnum.LIKE ? 'like' : 'dislike';
    setFeedback(prevFeedback => {
      const newFeedback = { ...prevFeedback };
      if (!newFeedback[index]) {
        newFeedback[index] = {};
      }

      if (newFeedback[index].type === feedbackType) {
        newFeedback[index].type = undefined;
        newFeedback[index].showFeedbackOptions = false;
      } else {
        newFeedback[index].type = feedbackType;
        newFeedback[index].showFeedbackOptions = true;
      }

      return newFeedback;
    });
  }

  function handleFeedbackReason(index: number, reason: string) {
    setFeedback(prevFeedback => {
      const newFeedback = { ...prevFeedback };
      if (!newFeedback[index]) {
        newFeedback[index] = {};
      }
      newFeedback[index].reason = reason;
      newFeedback[index].promptForFeedback = reason === 'Other';
      return newFeedback;
    });
  }

  async function handleSubmitFeedback(index: number) {
    const feedbackData = feedback[index];
    if (!feedbackData) {
      return;
    }

    try {
      await chatbotApi.submitFeedback(messages[index], feedbackData);
      alertApi.post({
        severity: 'success',
        message: 'Thank you for your feedback!',
      });
      setFeedback(prevFeedback => {
        const newFeedback = { ...prevFeedback };
        newFeedback[index].submitted = true;
        newFeedback[index].showFeedbackOptions = false;
        return newFeedback;
      });
      const updatedMessages = messages.map((msg, i) => {
        if (i === index) {
          return { ...msg, showFeedbackOptions: false };
        }
        return msg;
      });
      setMessages(updatedMessages);
    } catch (error) {
      alertApi.post({
        severity: 'error',
        message:
          'There was an error submitting your feedback. Please try again.',
      });
    }
  }

  function handleCopyToClipboard(index: number) {
    const messageText = messages[index]?.text || '';
    window.navigator.clipboard
      .writeText(messageText)
      .then(() => {
        alertApi.post({
          severity: 'success',
          message: 'Text copied to clipboard',
        });
      })
      .catch(() => {
        alertApi.post({
          severity: 'error',
          message: 'Failed to copy text',
        });
      });
  }

  return (
    <>
      {messages.map((message, index) => {
        const isLiked = feedback[index]?.type === 'like';
        const showFeedbackOptions = feedback[index]?.showFeedbackOptions;
        const feedbackSubmitted = feedback[index]?.submitted;

        return (
          <div
            key={`${index}-${message.timestamp}`}
            data-message-timestamp={message.timestamp}
          >
            <ChatMessage
              message={message}
              botName={botName}
              botIcon={botIcon}
              fontSizes={fontSizes}
              executionPlanBuffer={executionPlanBuffer}
              executionPlanHistory={executionPlanHistory}
              autoExpandExecutionPlans={autoExpandExecutionPlans}
              executionPlanLoading={executionPlanLoading}
              onMetadataSubmit={onMetadataSubmit}
            />

            {!message.isUser && (
              <Box display="flex" alignItems="center" mt={1} mb={2}>
                <FeedbackButton
                  enabled={!feedbackSubmitted}
                  feedback={feedback[index]?.type}
                  handleFeedback={fb => handleFeedback(index, fb)}
                  handleCopyToClipBoard={() => handleCopyToClipboard(index)}
                />
              </Box>
            )}

            {showFeedbackOptions && !message.isUser && (
              <Box mb={2} p={2} bgcolor="background.paper" borderRadius={1}>
                <Box display="flex" flexWrap="wrap" mb={2}>
                  {isLiked
                    ? [
                        'Very Helpful',
                        'Accurate',
                        'Simplified My Task',
                        'Other',
                      ].map(reason => (
                        <Chip
                          key={reason}
                          label={reason}
                          clickable
                          color={
                            feedback[index]?.reason === reason
                              ? 'primary'
                              : 'default'
                          }
                          onClick={() => handleFeedbackReason(index, reason)}
                          style={{ margin: 4 }}
                        />
                      ))
                    : [
                        'Inaccurate',
                        'Poorly Formatted',
                        'Incomplete',
                        'Off-topic',
                        'Other',
                      ].map(reason => (
                        <Chip
                          key={reason}
                          label={reason}
                          clickable
                          color={
                            feedback[index]?.reason === reason
                              ? 'primary'
                              : 'default'
                          }
                          onClick={() => handleFeedbackReason(index, reason)}
                          style={{ margin: 4 }}
                        />
                      ))}
                </Box>
                {feedback[index]?.promptForFeedback && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    placeholder="Provide additional feedback"
                    value={feedback[index]?.additionalFeedback || ''}
                    onChange={e =>
                      setFeedback(prevFeedback => {
                        const newFeedback = { ...prevFeedback };
                        if (!newFeedback[index]) {
                          newFeedback[index] = {};
                        }
                        newFeedback[index].additionalFeedback = e.target.value;
                        return newFeedback;
                      })
                    }
                    style={{ marginBottom: 8 }}
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleSubmitFeedback(index)}
                  disabled={!feedback[index]?.reason}
                >
                  Submit Feedback
                </Button>
              </Box>
            )}
          </div>
        );
      })}
    </>
  );
}

export default ChatFeedback;
