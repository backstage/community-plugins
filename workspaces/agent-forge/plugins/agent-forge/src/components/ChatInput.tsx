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
import sendIcon from '../icons/send-icon.svg';
import useStyles from './useStyles';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleMessageSubmit: () => void;
  disabled?: boolean;
}

function ChatInput({
  input,
  disabled = false,
  setInput,
  handleMessageSubmit,
}: ChatInputProps) {
  const styles = useStyles();
  return (
    <TextField
      value={input}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setInput(e.target.value)
      }
      placeholder="Type here..."
      variant="standard"
      className={styles.inputField}
      disabled={disabled}
      sx={{
        boxShadow: 4,
        background: '#fff',
      }}
      multiline
      maxRows={2}
      onKeyUp={(e: React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!e.shiftKey && e.key === 'Enter') handleMessageSubmit();
        else return;
      }}
      InputProps={{
        disableUnderline: true,
        sx: {
          margin: 1,
          paddingLeft: 2,
          borderRadius: '10px',
          borderWidth: '2px',
          borderColor: '#889099',
          borderStyle: 'solid',
          color: '#000',
        },
        endAdornment: (
          <IconButton
            className={styles.sendButton}
            onClick={handleMessageSubmit}
            disabled={input.trim().length === 0}
          >
            <img className={styles.sendButtonImage} src={sendIcon} alt="Send" />
          </IconButton>
        ),
      }}
      // eslint-disable-next-line
      autoFocus
    />
  );
}

export default ChatInput;
