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
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(_ => ({
  // General Styles
  lightMode: {
    '--background': 'white',
    '--input-container': '#282828',
    '--bot-response': '#F3F3F3',
    '--user-response': '#A2DCE8',
    '--greeting-text-color': '#1F3C61',
    '--tab-bg': 'white',
    '--tab-text': '#1F3C61',
    '--tab-hover-bg': 'linear-gradient(to right, #9345E1,#2979C7,#00C4D3)',
    '--tab-hover-text': 'rgb(255, 255, 255)',
    '--tab-outline': '#2979C7',
    '--assistant-message-bg': '#282828',
    '--assistant-message-text': 'white',
    '--feedback-button-bg':
      'linear-gradient(to right, #9345E1,#2979C7,#00C4D3)',
    '--feedback-button-text': 'white',
    '--input-bg': '#ffffff',
    '--input-text': '#4d4b4b',
    '--feedback-option-bg': '#F3F3F3',
    '--feedback-option-text': '#303030',
    '--feedback-option-hover-bg': '#d3d3d3',
    '--feedback-option-selected-bg': '#d3d3d3',
    '--feedback-option-selected-text': '#303030',
    '--feedback-option-outline': '#999',
  },
  darkMode: {
    '--background': '#1d1d1d',
    '--input-container': 'linear-gradient(to right, #1896d1, #0c4d6b)',
    '--bot-response': '#3a3939',
    '--user-response': '#525151',
    '--greeting-text-color': 'white',
    '--tab-bg': '#1d1d1d',
    '--tab-text': 'white',
    '--tab-hover-bg': 'linear-gradient(to right, #9345E1,#2979C7,#00C4D3)',
    '--tab-hover-text': 'white',
    '--tab-outline': 'linear-gradient(to right, #9345E1,#2979C7,#00C4D3)',
    '--assistant-message-bg': 'linear-gradient(to right, #1896d1, #0c4d6b)',
    '--assistant-message-text': 'white',
    '--outline-color': 'black',
    '--feedback-button-bg': '#2979C7',
    '--feedback-button-text': 'white',
    '--input-bg': '#1d1d1d',
    '--input-text': 'white',
    '--feedback-option-bg': '#3a3939',
    '--feedback-option-text': 'white',
    '--feedback-option-hover-bg': '#505050',
    '--feedback-option-selected-bg': '#d3d3d3',
    '--feedback-option-selected-text': 'black',
    '--feedback-option-outline': 'white',
  },

  // Specific Classes
  chatPanel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '625px',
    height: '84%',
    backgroundColor: 'var(--background)',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(100%)',
    borderRadius: '8px 8px 0 0',
    transition: 'transform 0.3s ease',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    outline: '1px solid var(--outline-color)',
    '&.open': {
      transform: 'translateY(0)',
    },
  },

  chatContainer: {
    width: '100%',
    height: '100%',
  },

  chatPanelMaximized: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '85%',
    height: '85%',
    backgroundColor: 'var(--background)',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(100%)',
    transition: 'transform 0.3s ease',
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    outline: '1px solid var(--outline-color)',
    '&.open': {
      transform: 'translateY(0)',
    },
  },
  //
  // inputContainer: {
  //   position: 'absolute',
  //   bottom: 0,
  //   width: '100%',
  //   padding: '10px 20px',
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   height: 75,
  //   background: 'var(--input-container)',
  // },

  botMessage: {
    backgroundColor: 'var(--bot-response)',
    padding: 10,
    alignSelf: 'flex-start',
    textAlign: 'left',
    position: 'relative',
    wordWrap: 'break-word',
    hyphens: 'auto',
  },

  userMessage: {
    backgroundColor: 'var(--user-response)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-end',
    textAlign: 'left',
    maxWidth: '80%',
  },

  tabButton: {
    width: '80%',
    padding: 10,
    margin: '10px 0',
    border: '2px solid var(--tab-outline)',
    background: 'var(--tab-bg)',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'center',
    color: 'var(--tab-text)',
    fontSize: 16,
    transition:
      'background-color 0.5s ease-in-out, color 0.6s, border-color 0.5s ease-in-out',
    position: 'relative',
    '&:hover': {
      background: 'var(--tab-hover-bg)',
      color: 'var(--tab-hover-text)',
    },
    '&.clicked': {
      background: 'var(--tab-hover-bg)',
      color: 'var(--tab-hover-text)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      background: 'var(--tab-bg)',
      zIndex: -1,
      borderRadius: 8,
    },
  },

  msgButton: {
    width: '100%',
    padding: 8,
    margin: '8px 0',
    border: '1px solid var(--tab-outline)',
    background: 'var(--tab-bg)',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: 12,
    transition:
      'background-color 0.5s ease-in-out, color 0.3s, border-color 0.5s ease-in-out',
    position: 'relative',
    '&:hover': {
      background: 'var(--tab-hover-bg)',
      color: 'var(--tab-hover-text)',
    },
    '&.clicked': {
      background: 'var(--tab-hover-bg)',
      color: 'var(--tab-hover-text)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      background: 'var(--tab-outline)',
      zIndex: -1,
      borderRadius: 8,
    },
  },

  suggestionButton: {
    padding: 8,
    margin: '2px 0',
    borderRadius: 8,
    border: '1px solid var(--tab-text)',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: 12,
    transition:
      'background-color 0.5s ease-in-out, color 0.3s, border-color 0.5s ease-in-out',
    '&:hover': {
      background: 'var(--input-bg)',
    },
    '&.clicked': {
      background: 'var(--input-bg)',
    },
  },

  assistantMessageBottom: {
    background: 'var(--assistant-message-bg)',
    color: 'var(--assistant-message-text)',
    textAlign: 'center',
    fontSize: 14,
    padding: '4px 0',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
  },

  buttonOpenChat: {
    position: 'fixed',
    bottom: 50,
    right: 60,
    width: 100,
    height: 100,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    zIndex: 1000,
  },

  darkModeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: 50,
    width: 25,
    height: 22,
  },

  chatPanelHeader: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    textAlign: 'left',
    background: 'linear-gradient(to top, #0000006D, #000000)',
    border: 'none',
    color: '#ffffff',
    margin: 0,
    fontSize: 10,
    paddingInline: 10,
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    borderRadius: '8px 8px 0 0',
  },

  chatPanelHeaderBG: {
    background: 'linear-gradient(to right, #9345E1,#2979C7,#00C4D3)',
    borderRadius: '8px 8px 0 0',
  },
  greetingSection: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  greetingLogo: {
    width: 90,
    height: 90,
    objectFit: 'contain',
  },

  greetingText: {
    fontSize: 24,
    marginTop: 20,
    fontWeight: 'bold',
    color: 'var(--greeting-text-color)',
  },

  tabs: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 30,
  },

  chat: {
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    overflowY: 'auto',
    flexGrow: 1,
    maxHeight: '80%',
  },

  inputField: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    padding: 4,
    color: 'var(--input-text)',
    resize: 'none',
    fontFamily: 'inherit',
    outline: 'none',
    '&:focus': {
      border: 'none',
      outline: 'none',
    },
  },

  sendButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    backgroundColor: 'transparent',
  },

  sendButtonImage: {
    width: 24,
    height: 24,
    fill: '#222',
  },

  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'left',
    marginTop: 5,
  },

  todayContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0',
    position: 'relative',
  },

  todayLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
    margin: '0 10px',
  },

  todayText: {
    fontSize: 12,
    color: '#999',
    whiteSpace: 'nowrap',
    backgroundColor: 'var(--background)',
    zIndex: 1,
  },

  feedbackOptions: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingBottom: '20px',
  },

  feedbackReason: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 8,
    backgroundColor: 'var(--feedback-option-bg)',
    color: 'var(--feedback-option-text)',
    border: '2px solid var(--feedback-option-outline)',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
    '&:hover': {
      backgroundColor: 'var(--feedback-option-hover-bg)',
    },
    '&.selected': {
      backgroundColor: 'var(--feedback-option-selected-bg)',
      color: 'var(--feedback-option-selected-text)',
      borderColor: 'var(--feedback-option-selected-border)',
      marginBottom: '15px',
    },
  },

  feedbackReasons: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },

  feedbackIcons: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },

  feedbackIconImage: {
    width: 18,
    height: 18,
    cursor: 'pointer',
  },

  feedbackContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderTop: '1px solid #ccc',
    borderBottom: '1px solid #ccc',
    backgroundColor: 'var(--feedback-button-bg)',
  },
  feedbackOption: {
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    backgroundColor: 'var(--feedback-option-bg)',
    color: 'var(--feedback-option-text)',
    border: '1px solid transparent',
    '&.selected': {
      backgroundColor: 'var(--feedback-option-selected-bg)',
      borderColor: 'var(--feedback-option-selected-border)',
    },
  },

  submitButton: {
    marginBottom: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },

  botLogo: {
    width: 20,
    height: 20,
    objectFit: 'contain',
    marginRight: 10,
  },

  optionsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },

  optionContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 5,
  },

  suggestionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },

  lineAboveTimestamp: {
    border: 'none',
    borderTop: '1px solid #999',
    marginTop: 5,
    marginBottom: 5,
  },

  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontSize: '24px',
    color: '#999',
    marginTop: '10px',

    '&.visible': {
      display: 'flex',
    },
  },

  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#049fd9',
    borderRadius: '50%',
    margin: '0 2px',
    animation: '$blink 1s infinite',

    '&:nth-child(1) ': {
      animationDelay: 'Os',
    },

    '&:nth-child(2) ': {
      animationDelay: '0.25s',
    },

    '&:nth-child(3)': {
      animationDelay: '0.45s',
    },
  },

  '@keyframes blink': {
    '0%': {
      opacity: 0.2,
    },
    ' 20%': {
      opacity: 1,
    },
    '100%': {
      opacity: 0.2,
    },
  },
  '@media (max-width: 625px)': {
    chatContainer: {
      height: '100%',
      width: '100%',
    },
    buttonOpenChat: {
      width: 50,
      height: 50,
    },
    inputField: {
      width: '100%',
      marginRight: 0,
    },
    inputContainer: {
      padding: '5px 10px',
    },
    feedbackContainer: {
      flexDirection: 'column',
      gap: 10,
    },
    tabs: {
      marginTop: 10,
    },
  },

  '@media (min-width: 700px)': {
    chatContainer: {
      margin: 'auto',
      width: '70%',
    },
    buttonOpenChat: {
      width: 50,
      height: 50,
    },
    inputField: {
      width: '100%',
      marginRight: 0,
    },
    inputContainer: {
      padding: '5px 10px',
    },
    feedbackContainer: {
      flexDirection: 'column',
      gap: 10,
    },
    tabs: {
      marginTop: 10,
    },
  },
}));

export default useStyles;
