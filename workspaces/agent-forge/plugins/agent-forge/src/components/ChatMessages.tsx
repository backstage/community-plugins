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
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import WebexLogo from '../icons/jarvis.png';
import TypingIndicator from './TypingIndicator';
import { FeedbackButton } from './FeedbackButton';
import Chip from '@mui/material/Chip';
import { Feedback, Message } from '../types';
import useStyles from './useStyles';
import { MarkdownContent } from '@backstage/core-components';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import useAsync from 'react-use/esm/useAsync';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { isProviderField, isModelField } from '../utils/helpers';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

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
  showFormMode?: boolean;
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
  showFormMode = true,
}) => {
  const handleTabClick = (m: string) => {
    handleMessageSubmit(m);
  };
  const styles = useStyles();

  const initialFormData = useMemo(() => {
    const data: { [key: number]: { [key: string]: string } } = {};
    messages.forEach((message, index) => {
      if (message.metadata?.input_fields) {
        if (Array.isArray(message.metadata.input_fields)) {
          // Legacy structure
          message.metadata.input_fields.forEach(input => {
            if (!data[index]) data[index] = {};
            data[index][input.field_name] = '';
          });
        } else if (message.metadata.input_fields.fields) {
          // New structure
          data[index] = {};
          message.metadata.input_fields.fields.forEach(field => {
            // Set initial value from provided_value if available, otherwise empty string
            if (
              field.provided_value !== undefined &&
              field.provided_value !== null
            ) {
              data[index][field.name] = field.provided_value.toString();
            } else {
              data[index][field.name] = '';
            }
          });
        }
      }
    });
    return data;
  }, [messages]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when messages change to handle new provided_value
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');

  const handleClose = () => {
    setCopyConfirm(false);
  };

  const handleInputChange = useCallback(
    (index: number, fieldName: string, value: string) => {
      setFormData(prevData => {
        const newData = {
          ...prevData,
          [index]: {
            ...prevData[index],
            [fieldName]: value,
          },
        };
        return newData;
      });

      if (isProviderField(fieldName)) {
        setSelectedProvider(value);
      }
    },
    [],
  );

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
    const showFeedback = false;

    if (message.isUser)
      // eslint-disable-next-line
      return <UserMessage message={message.text || ''} key={index} />;
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

          {/* Show message text only when no form is displayed OR when showFormMode is false */}
          {(() => {
            const messageText =
              message.text ||
              (message.parts &&
                message.parts[0] &&
                message.parts[0].kind === 'text' &&
                message.parts[0].text);
            const hasForm =
              message.metadata?.input_fields &&
              (Array.isArray(message.metadata.input_fields)
                ? message.metadata.input_fields.length > 0
                : message.metadata.input_fields.fields?.length > 0);

            // Only show text if there's no form OR if showFormMode is false (text-only mode)
            return messageText && (!hasForm || !showFormMode)
              ? messageText
                  .split('\n')
                  .map((line, idx) => (
                    <MarkdownContent
                      key={idx}
                      content={line}
                      transformLinkUri={uri =>
                        uri.startsWith('http') ? uri : ''
                      }
                      linkTarget="_blank"
                    />
                  ))
              : null;
          })()}

          {/* Show form if input_fields metadata exists AND showFormMode is true */}
          {showFormMode &&
            message.metadata?.input_fields &&
            (Array.isArray(message.metadata.input_fields)
              ? message.metadata.input_fields.length > 0
              : message.metadata.input_fields.fields?.length > 0) && (
              <Box mb={3} mt={1}>
                {/* Legacy form structure */}
                {Array.isArray(message.metadata.input_fields) && (
                  <form
                    onSubmit={event => {
                      event.preventDefault();
                      handleMessageSubmit(JSON.stringify(formData[index]));
                    }}
                  >
                    {message.metadata.input_fields.map((input, i) => {
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
                              input.field_values &&
                              input.field_values.length > 0
                                ? 'outlined'
                                : 'standard'
                            }
                            helperText={input.field_description}
                            size="small"
                            select={
                              input.field_values &&
                              input.field_values.length > 0
                            }
                            onChange={e => {
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
                                    isModelField(field_name) &&
                                    !selectedProvider
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
                )}

                {/* New form structure */}
                {!Array.isArray(message.metadata.input_fields) &&
                  message.metadata.input_fields?.fields && (
                    <Box>
                      {/* Form explanation */}
                      {message.metadata.form_explanation && (
                        <Box
                          mb={2}
                          p={2}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <Typography variant="body1">
                            {message.metadata.form_explanation.replace(
                              /^"|"$/g,
                              '',
                            )}
                          </Typography>
                        </Box>
                      )}

                      {/* Tool info header */}
                      {message.metadata.input_fields.tool_info && (
                        <Box
                          mb={2}
                          p={2}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ color: 'white', mb: 1 }}
                          >
                            {message.metadata.input_fields.tool_info.operation}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                          >
                            {
                              message.metadata.input_fields.tool_info
                                .description
                            }
                          </Typography>
                          {message.metadata.input_fields.summary && (
                            <Box mt={1} display="flex" gap={2} flexWrap="wrap">
                              <Chip
                                label={`Required: ${message.metadata.input_fields.summary.missing_required} missing`}
                                color="error"
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={`Optional: ${message.metadata.input_fields.summary.total_optional}`}
                                color="info"
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          )}
                        </Box>
                      )}

                      <form
                        onSubmit={event => {
                          event.preventDefault();
                          handleMessageSubmit(JSON.stringify(formData[index]));
                        }}
                      >
                        {message.metadata.input_fields.fields.map(
                          (field, i) => {
                            const isRequired = field.required;
                            const isMissing = field.status === 'missing';
                            const isBoolean = field.type === 'boolean';

                            return (
                              <Box key={i} mb={2}>
                                {isBoolean ? (
                                  // Use Material-UI Select for boolean fields
                                  <Box>
                                    <Typography
                                      component="label"
                                      variant="body2"
                                      sx={{
                                        display: 'block',
                                        color: 'rgba(0, 0, 0, 0.87)',
                                        marginBottom: 1,
                                        fontWeight: 500,
                                      }}
                                    >
                                      {field.title}
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                      <Select
                                        value={
                                          formData[index]?.[field.name] || ''
                                        }
                                        onChange={e => {
                                          handleInputChange(
                                            index,
                                            field.name,
                                            e.target.value,
                                          );
                                        }}
                                        sx={{
                                          backgroundColor:
                                            'rgba(255, 255, 255, 0.05)',
                                          '& .MuiOutlinedInput-root': {
                                            '&:hover': {
                                              backgroundColor:
                                                'rgba(255, 255, 255, 0.08)',
                                            },
                                            '&.Mui-focused': {
                                              backgroundColor:
                                                'rgba(255, 255, 255, 0.1)',
                                            },
                                          },
                                          '& .MuiSelect-icon': {
                                            color: 'rgba(255, 255, 255, 0.7)',
                                          },
                                          '& .MuiInputBase-input': {
                                            color: 'rgba(255, 255, 255, 0.87)',
                                          },
                                        }}
                                      >
                                        <MenuItem value="">
                                          Select a value
                                        </MenuItem>
                                        <MenuItem value="true">true</MenuItem>
                                        <MenuItem value="false">false</MenuItem>
                                      </Select>
                                    </FormControl>
                                    {field.description && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: 'rgba(0, 0, 0, 0.6)',
                                          display: 'block',
                                          marginTop: 0.5,
                                          marginLeft: '14px',
                                        }}
                                      >
                                        {field.description}
                                      </Typography>
                                    )}
                                  </Box>
                                ) : (
                                  // Use Material-UI TextField for non-boolean fields
                                  <TextField
                                    fullWidth
                                    id={field.name}
                                    label={field.title}
                                    variant="outlined"
                                    helperText={field.description}
                                    size="small"
                                    required={isRequired}
                                    error={isRequired && isMissing}
                                    value={formData[index]?.[field.name] || ''}
                                    sx={{
                                      marginBottom: 1,
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor:
                                          'rgba(255, 255, 255, 0.05)',
                                        '&:hover': {
                                          backgroundColor:
                                            'rgba(255, 255, 255, 0.08)',
                                        },
                                        '&.Mui-focused': {
                                          backgroundColor:
                                            'rgba(255, 255, 255, 0.1)',
                                        },
                                      },
                                      '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                      },
                                      '& .MuiInputBase-input': {
                                        color: 'white',
                                      },
                                      '& .MuiFormHelperText-root': {
                                        color: 'rgba(255, 255, 255, 0.6)',
                                      },
                                    }}
                                    onChange={e => {
                                      handleInputChange(
                                        index,
                                        field.name,
                                        e.target.value,
                                      );
                                    }}
                                  />
                                )}
                              </Box>
                            );
                          },
                        )}

                        <Box display="flex" gap={2} mt={3}>
                          <Button
                            type="submit"
                            variant="contained"
                            sx={{
                              backgroundColor: '#9345E1',
                              '&:hover': {
                                backgroundColor: '#7a3bc7',
                              },
                            }}
                          >
                            Submit
                          </Button>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() => {
                              // Reset form data for this message
                              setFormData(prevData => ({
                                ...prevData,
                                [index]: {},
                              }));
                            }}
                            sx={{
                              borderColor: 'rgba(0, 0, 0, 0.4)',
                              color: 'rgba(0, 0, 0, 0.87)',
                              '&:hover': {
                                borderColor: 'rgba(0, 0, 0, 0.6)',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              },
                            }}
                          >
                            Reset
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  )}
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
          {showFeedback && (
            <div className={styles.feedbackIcons}>
              <FeedbackButton
                enabled={!feedbackSubmitted}
                feedback={feedback[index]?.type}
                handleFeedback={fb => handleFeedback(index, fb)}
                handleCopyToClipBoard={() => {
                  setCopyConfirm(true);
                  const textToCopy =
                    message.text ||
                    (message.parts &&
                      message.parts[0] &&
                      message.parts[0].kind === 'text' &&
                      message.parts[0].text) ||
                    '';
                  window.navigator.clipboard.writeText(textToCopy);
                }}
              />
            </div>
          )}

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
        {messages.map((message, index) => {
          return renderMessage(message, index, handleInputChange);
        })}
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
