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
import React, { useMemo, useState } from 'react';
import WebexLogo from '../icons/jarvis.png';
import TypingIndicator from './TypingIndicator';
import { FeedbackButton } from './FeedbackButton';
import Chip from '@mui/material/Chip';
import { Feedback, Message } from '../types';
import useStyles from './useStyles';
import { MarkdownContent } from '@backstage/core-components';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Box';
import TextField from '@mui/material/Box';
import MenuItem from '@mui/material/Box';
import Button from '@mui/material/Box';
import Snackbar from '@mui/material/Box';
import { useAsync } from 'react-use';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { isProviderField, isModelField } from '../utils/helpers';

interface ChatMessagesProps {
  handleMessageSubmit: (msg?: string) => void;
  messages: Message[];
  feedback: { [key: number]: Feedback };
  isTyping: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement>;
  handleFeedback: (index: number, type: string) => void;
  handleFeedbackReason: (index: number, reason: string) => void;
  handleSubmitFeedback: (index: number) => void;
  handleOptionSelection: (option: string) => void;
  setFeedback: React.Dispatch<
    React.SetStateAction<{ [key: number]: Feedback }>
  >;
  providerModelsMap: { [key: string]: string[] };
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  handleMessageSubmit,
  messages,
  feedback,
  isTyping,
  chatContainerRef,
  handleFeedback,
  handleFeedbackReason,
  handleSubmitFeedback,
  handleOptionSelection,
  setFeedback,
  providerModelsMap,
}) => {
  const handleTabClick = (m: string) => {
    handleMessageSubmit(m);
  };
  const styles = useStyles();

  const initialFormData = useMemo(
    () =>
      messages.reduce((acc, message, index) => {
        acc[index] =
          message.metadata?.input_fields?.reduce((fieldAcc, field) => {
            fieldAcc[field.field_name] = '';
            return fieldAcc;
          }, {} as Record<string, string>) || {};
        return acc;
      }, {} as Record<number, Record<string, string>>),
    [messages],
  );

  const [formData, setFormData] = useState(initialFormData);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');

  const handleClose = () => {
    setCopyConfirm(false);
  };

  const handleInputChange = (
    index: number,
    fieldName: string,
    value: string,
  ) => {
    setFormData(prevData => ({
      ...prevData,
      [index]: {
        ...prevData[index],
        [fieldName]: value,
      },
    }));

    if (isProviderField(fieldName)) {
      setSelectedProvider(value);
    }
  };

  const filterModels = (models: string[], provider: string) => {
    return providerModelsMap[provider] || models;
  };

  const renderMessage = (
    message: Message,
    index: number,
    // eslint-disable-next-line
    handleInputChange: (
      index: number,
      fieldName: string,
      value: string,
    ) => void,
  ) => {
    const isLiked = feedback[index]?.type === 'like';
    const showFeedbackOptions = feedback[index]?.showFeedbackOptions;
    const feedbackSubmitted = feedback[index]?.submitted;

    if (message.isUser)
      // eslint-disable-next-line
      return <UserMessage message={message.text} key={index} />;
    return (
      <Box
        key={index}
        paddingLeft={1}
        marginBottom={3}
        sx={{
          background:
            'linear-gradient(to top, #0000006D, #000000), linear-gradient(to right, #9345E1,#2979C7,#00C4D3)',
          borderRadius: '4px',
        }}
      >
        <div className={styles.botMessage}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center">
              <img src={WebexLogo} alt="Bot logo" className={styles.botLogo} />
              <Typography sx={{ fontWeight: 700 }}>Jarvis</Typography>
            </Box>
            <div className={styles.timestamp}>{message.timestamp}</div>
          </Box>
          {message.text?.split('\n').map((line, idx) => (
            <MarkdownContent
              key={idx}
              content={line}
              transformLinkUri={uri => (uri.startsWith('http') ? uri : '')}
              linkTarget="_blank"
            />
          ))}

          {message.metadata?.input_fields &&
            message.metadata?.input_fields?.length > 0 && (
              <Box mb={3} mt={1}>
                <form
                  onSubmit={event => {
                    event.preventDefault();
                    handleMessageSubmit(JSON.stringify(formData[index]));
                  }}
                >
                  {message.metadata?.input_fields.map((input, i) => {
                    const field_name = input.field_name
                      .split('_')
                      .map(
                        word =>
                          word.charAt(0).toLocaleUpperCase() + word.slice(1),
                      )
                      .join(' ');

                    if (isModelField(input.field_name)) {
                      input.field_values = filterModels(
                        input.field_values || [],
                        selectedProvider,
                      );
                    }

                    return (
                      <Box key={i}>
                        <TextField
                          fullWidth
                          id={field_name}
                          label={field_name}
                          variant={
                            input.field_values && input.field_values.length > 0
                              ? 'outlined'
                              : 'standard'
                          }
                          helperText={input.field_description}
                          size="small"
                          select={
                            input.field_values && input.field_values.length > 0
                          }
                          onChange={e => {
                            // console.log(`Field Name: ${field_name}, Value: ${e.target.value}`);
                            handleInputChange(
                              index,
                              field_name,
                              e.target.value,
                            );
                          }}
                          sx={{ marginBottom: 2 }}
                        >
                          {input.field_values &&
                            input.field_values.length > 0 &&
                            input.field_values.map((fieldValue, idx) => (
                              <MenuItem
                                key={idx}
                                value={fieldValue}
                                disabled={
                                  isModelField(field_name) && !selectedProvider
                                }
                                onClick={() => {}}
                              >
                                {fieldValue}
                              </MenuItem>
                            ))}
                        </TextField>
                      </Box>
                    );
                  })}
                  <Button
                    type="submit"
                    sx={{ marginTop: 2 }}
                    variant="outlined"
                  >
                    Submit
                  </Button>
                </form>
              </Box>
            )}

          {message.suggestions && message.suggestions.length > 0 && (
            <div className={styles.suggestionsContainer}>
              {message.suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  className={styles.suggestionButton}
                  onClick={() => handleTabClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}

          {message.options && message.options.length > 0 && (
            <div className={styles.optionsContainer}>
              {message.options.map((option, idx) => (
                <div key={idx} className={styles.optionContainer}>
                  <input
                    type="radio"
                    id={`${index}-${idx}`}
                    name={`options-${index}`}
                    value={(idx + 1).toString()} // '1', '2', or '3'
                    onChange={e => handleOptionSelection(e.target.value)}
                  />
                  <label htmlFor={`${index}-${idx}`}>{option}</label>
                </div>
              ))}
              <div className={styles.optionContainer}>
                <input
                  type="radio"
                  id={`option-${index}-no`}
                  name={`options-${index}`}
                  value="no"
                  onChange={e => handleOptionSelection(e.target.value)}
                />
                <label htmlFor={`option-${index}-no`}>
                  none of these options
                </label>
              </div>
            </div>
          )}

          <div className={styles.feedbackIcons}>
            <FeedbackButton
              enabled={!feedbackSubmitted}
              feedback={feedback[index]?.type}
              handleFeedback={fb => handleFeedback(index, fb)}
              handleCopyToClipBoard={() => {
                setCopyConfirm(true);
                window.navigator.clipboard.writeText(message.text);
              }}
            />
          </div>
          {showFeedbackOptions && (
            <div className={styles.feedbackOptions}>
              <div className={styles.feedbackReasons}>
                {isLiked
                  ? [
                      'Very Helpful',
                      'Accurate',
                      'Simplified My Task',
                      'Other',
                    ].map(reason => (
                      <Chip
                        key={reason}
                        clickable
                        className={`${styles.feedbackReason} ${
                          feedback[index]?.reason === reason ? 'selected' : ''
                        }`}
                        onClick={() => handleFeedbackReason(index, reason)}
                        label={reason}
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
                        clickable
                        className={`${styles.feedbackReason} ${
                          feedback[index]?.reason === reason ? 'selected' : ''
                        }`}
                        onClick={() => handleFeedbackReason(index, reason)}
                        label={reason}
                      />
                    ))}
              </div>
              {feedback[index]?.promptForFeedback && (
                <textarea
                  placeholder="Provide additional feedback"
                  value={feedback[index]?.additionalFeedback || ''}
                  onChange={e =>
                    setFeedback(prevFeedback => {
                      const newFeedback = { ...prevFeedback };
                      newFeedback[index].additionalFeedback = e.target.value;
                      return newFeedback;
                    })
                  }
                />
              )}
              <Button
                className={styles.submitButton}
                onClick={() => handleSubmitFeedback(index)}
              >
                Submit Feedback
              </Button>
            </div>
          )}
        </div>
      </Box>
    );
  };

  return (
    <>
      <div className={styles.chat} ref={chatContainerRef}>
        {messages.map((message, index) =>
          renderMessage(message, index, handleInputChange),
        )}
        {isTyping && (
          <Box>
            <Box display="flex" alignItems="center">
              <img src={WebexLogo} alt="Bot logo" className={styles.botLogo} />
              <Typography sx={{ fontWeight: 700 }}>Jarvis</Typography>
            </Box>
            <TypingIndicator />
          </Box>
        )}
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={copyConfirm}
        onClose={handleClose}
        message="Text copied"
        key="bottom-right"
      />
    </>
  );
};

interface UserMessageProps {
  message: string;
}

const UserMessage = ({ message }: UserMessageProps) => {
  let parsedMessage: Record<string, any> | null = null;

  const identityApi = useApi(identityApiRef);

  const { value: profile } = useAsync(() => identityApi.getProfileInfo());

  try {
    parsedMessage = JSON.parse(message);
  } catch (error) {
    parsedMessage = null;
  }

  const isJsonStringifiedFormData = (msg: any): boolean => {
    return (
      msg &&
      typeof msg === 'object' &&
      !Array.isArray(msg) &&
      Object.keys(msg).length > 0
    );
  };

  return (
    <Box display="flex" width="100%" flexDirection="column" marginBottom={4}>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          width={24}
          height={24}
          borderRadius="50%"
          sx={{
            backgroundColor: '#1b0b34',
            backgroundImage: `url("${profile?.picture}")`,
            backgroundSize: 'cover',
          }}
        />
        <Box maxWidth="100%">
          <Typography sx={{ fontWeight: 700 }}>You</Typography>
        </Box>
      </Box>
      {parsedMessage && isJsonStringifiedFormData(parsedMessage) ? (
        <Box>
          {Object.entries(parsedMessage).map(([key, value]) => (
            <Typography key={key} variant="body1" sx={{ fontWeight: 600 }}>
              {`${key.charAt(0).toLocaleUpperCase() + key.slice(1)}: ${value}`}
            </Typography>
          ))}
        </Box>
      ) : (
        <Typography
          variant="body1"
          sx={{ maxWidth: '100%', whiteSpace: 'wrap', wordWrap: 'break-word' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default ChatMessages;
