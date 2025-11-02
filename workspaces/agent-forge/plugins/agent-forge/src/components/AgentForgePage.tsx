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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Content, Page } from '@backstage/core-components';
import {
  configApiRef,
  identityApiRef,
  useApi,
  alertApiRef,
} from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { makeStyles } from '@material-ui/core/styles';
import { v4 as uuidv4 } from 'uuid';

import { ChatbotApi } from '../apis';
import {
  DEFAULT_BOT_CONFIG,
  DEFAULT_SUGGESTIONS,
  DEFAULT_THINKING_MESSAGES,
} from '../constants';
import { Message } from '../types';
import { ChatSession, ChatStorage } from '../types/chat';
import { createTimestamp } from '../utils';
import { ChatContainer } from './ChatContainer';
import { PageHeader } from './PageHeader';
import { ChatSessionSidebar } from './ChatSessionSidebar';
import { useTokenAuthentication } from './ChatAssistantToken';
// @ts-ignore
import packageInfo from '../../package.json';

const useStyles = makeStyles(theme => ({
  errorBox: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
    wordBreak: 'break-word',
    fontSize: '0.8125rem',
    lineHeight: 1.3,
  },
  mainContent: {
    height: 'calc(100vh - 80px)',
    overflow: 'hidden',
    margin: 0,
    width: '100%',
    '& .MuiGrid-spacing-xs-1': {
      margin: 0,
      width: '100%',
      height: '100%',
    },
    '& .MuiGrid-spacing-xs-1 > .MuiGrid-item': {
      padding: theme.spacing(0.5),
    },
  },
  fullscreenContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
  },
  fullscreenContent: {
    flex: 1,
    overflow: 'hidden',
    padding: theme.spacing(2),
    display: 'flex',
    minHeight: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 500,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    lineHeight: 1.2,
    margin: 0,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontWeight: 400,
    opacity: 0.95,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    lineHeight: 1.3,
    margin: 0,
  },
  sidebarColumn: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatColumn: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  chatCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatCardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  fullscreenButton: {
    color: '#FFFFFF',
  },
  pageContainer: {
    height: 'calc(100vh - 64px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    '& > *': {
      flex: 1,
      overflow: 'hidden',
      minHeight: 0,
    },
  },
  contentWrapper: {
    height: '100%',
    overflow: 'hidden',
    padding: theme.spacing(1),
    width: '100%',
    boxSizing: 'border-box',
  },
  customHeaderContainer: {
    background:
      'linear-gradient(135deg, #004D40 0%, #00695C 25%, #00838F 50%, #1565C0 100%)',
    padding: theme.spacing(1, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#FFFFFF',
    minHeight: '56px',
    width: '100%',
    boxSizing: 'border-box',
  },
  customHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    flex: '0 0 auto',
  },
  customHeaderTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  headerBotAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'contain' as const,
  },
  customHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(4),
    flex: '0 0 auto',
    marginLeft: 'auto',
  },
  customHeaderStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '120px',
  },
  customHeaderLabel: {
    fontSize: '0.75rem',
    opacity: 0.85,
    fontWeight: 500,
    marginBottom: theme.spacing(0.25),
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  customHeaderValue: {
    fontSize: '0.9rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
}));

const STORAGE_KEY = 'agent-forge-chat-sessions';


/**
 * Agent Forge page component with chat history and message queuing
 * @public
 */
export function AgentForgePage() {
  const classes = useStyles();
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const alertApi = useApi(alertApiRef);

  const botName =
    config.getOptionalString('agentForge.botName') || DEFAULT_BOT_CONFIG.name;
  const botIcon =
    config.getOptionalString('agentForge.botIcon') || DEFAULT_BOT_CONFIG.icon;
  const initialSuggestions =
    config.getOptionalStringArray('agentForge.initialSuggestions') ||
    DEFAULT_SUGGESTIONS;
  const thinkingMessages =
    config.getOptionalStringArray('agentForge.thinkingMessages') ||
    DEFAULT_THINKING_MESSAGES;
  const thinkingMessagesInterval =
    config.getOptionalNumber('agentForge.thinkingMessagesInterval') || 7000;
  const backendUrl =
    config.getOptionalString('agentForge.baseUrl') ||
    config.getString('backend.baseUrl');
  const requestTimeout =
    config.getOptionalNumber('agentForge.requestTimeout') || 300;
  const enableStreaming = config.getOptionalBoolean('agentForge.enableStreaming') ?? false;
  
  // Config validation logs  
  console.log('Agent Forge Config - Streaming:', enableStreaming);
  const headerTitle =
    config.getOptionalString('agentForge.headerTitle') || botName;
  const headerSubtitle =
    config.getOptionalString('agentForge.headerSubtitle') ||
    'AI Platform Engineer Assistant';
  const inputPlaceholder =
    config.getOptionalString('agentForge.inputPlaceholder') ||
    `Ask ${botName} anything...`;

  // Font size configuration
  const fontSizes = {
    headerTitle:
      config.getOptionalString('agentForge.fontSize.headerTitle') || '1.125rem',
    headerSubtitle:
      config.getOptionalString('agentForge.fontSize.headerSubtitle') ||
      '0.75rem',
    messageText:
      config.getOptionalString('agentForge.fontSize.messageText') || '0.875rem',
    codeBlock:
      config.getOptionalString('agentForge.fontSize.codeBlock') || '0.9rem',
    inlineCode:
      config.getOptionalString('agentForge.fontSize.inlineCode') || '0.875rem',
    suggestionChip:
      config.getOptionalString('agentForge.fontSize.suggestionChip') ||
      '0.875rem',
    sidebarText:
      config.getOptionalString('agentForge.fontSize.sidebarText') || '0.875rem',
    inputField:
      config.getOptionalString('agentForge.fontSize.inputField') || '1rem',
    timestamp:
      config.getOptionalString('agentForge.fontSize.timestamp') || '0.75rem',
  };

  // Chat session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // UI state
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'checking' | 'connected' | 'disconnected'
  >('checking');
  
  // State for operational thinking messages
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [isInOperationalMode, setIsInOperationalMode] = useState(false);
  
  // Cache to track tool notifications we've shown in thinking indicator
  const toolNotificationsCache = useRef<Set<string>>(new Set());
  
  // State for execution plan processing
  const [isCapturingExecutionPlan, setIsCapturingExecutionPlan] = useState(false);
  const [accumulatedExecutionPlan, setAccumulatedExecutionPlan] = useState<string>('');
  
  
  // Function to remove cached tool notifications from content
  const removeCachedToolNotifications = useCallback((text: string): string => {
    let cleanText = text;
    const originalText = text;
    
    // 🚨 DEBUGGING: Check if input text contains execution plan markers
    if (text.includes('⧨') || text.includes('⧩')) {
      console.log('🚨 INPUT TEXT CONTAINS EXECUTION PLAN MARKERS');
      console.log('🚨 ORIGINAL TEXT:', text.substring(0, 200) + '...');
    }
    
    // Remove each cached notification from the text
    for (const notification of toolNotificationsCache.current) {
      const beforeRemoval = cleanText;
      
      // Remove the exact notification text (with optional newlines)
      const escapedNotification = notification.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\s*${escapedNotification}\\s*`, 'g');
      cleanText = cleanText.replace(regex, '');
      
      // 🚨 DEBUGGING: Check if we removed execution plan markers
      if (beforeRemoval !== cleanText && (beforeRemoval.includes('⧨') || beforeRemoval.includes('⧩'))) {
        console.log('🚨 REMOVED TEXT THAT CONTAINED EXECUTION PLAN MARKERS!');
        console.log('🚨 REMOVED NOTIFICATION:', notification.substring(0, 100) + '...');
        console.log('🚨 BEFORE:', beforeRemoval.substring(0, 200) + '...');
        console.log('🚨 AFTER:', cleanText.substring(0, 200) + '...');
      }
    }
    
    // Clean up any extra whitespace/newlines at the beginning
    cleanText = cleanText.replace(/^\s+/, '');
    
    console.log('CLEANED TEXT - original length:', originalText.length, 'cleaned length:', cleanText.length);
    
    // 🚨 DEBUGGING: Final check
    if (originalText.includes('⧨') || originalText.includes('⧩')) {
      const stillHasMarkers = cleanText.includes('⧨') || cleanText.includes('⧩');
      console.log('🚨 EXECUTION PLAN MARKERS AFTER CLEANING:', stillHasMarkers ? 'STILL PRESENT' : 'REMOVED!');
    }
    
    return cleanText;
  }, []);
  
  
  
  // Utility function to detect and parse tool notifications using metadata
  const detectToolNotification = (artifact: any): { isToolNotification: boolean; operation?: string; isStart?: boolean } => {
    if (!artifact || !artifact.name) {
      return { isToolNotification: false };
    }
    
    // Detect tool start notifications: name = "tool_notification_start"
    if (artifact.name === 'tool_notification_start') {
      // Extract tool name from description: "Tool call started: argocd" → "argocd"
      const toolName = artifact.description?.split(': ')[1] || 'tool';
      return { isToolNotification: true, operation: `Calling ${toolName}`, isStart: true };
    }
    
    // Detect tool end notifications: name = "tool_notification_end"  
    if (artifact.name === 'tool_notification_end') {
      // Extract tool name from description: "Tool call completed: argocd" → "argocd"
      const toolName = artifact.description?.split(': ')[1] || 'tool';
      return { isToolNotification: true, operation: `${toolName} completed`, isStart: false };
    }
    
    // Regular content (streaming_result, etc.)
    return { isToolNotification: false };
  };

  // Function to process streaming text and extract execution plans
  const processExecutionPlanMarkers = useCallback((text: string): {
    mainContent: string;
    executionPlanContent: string | null;
    shouldStartCapturing: boolean;
    shouldStopCapturing: boolean;
  } => {
    const startMarker = '⧨';
    const endMarker = '⧩';

    let mainContent = text;
    let executionPlanContent: string | null = null;
    let shouldStartCapturing = false;
    let shouldStopCapturing = false;

    // Reduced logging for performance
    if (process.env.NODE_ENV === 'development') {
      console.log('PROCESSING EXECUTION PLAN MARKERS - input text:', text.substring(0, 100) + '...');
      console.log('PROCESSING EXECUTION PLAN MARKERS - isCapturingExecutionPlan:', isCapturingExecutionPlan);
    }

    // 🔧 FALLBACK: Try to detect execution plan content without markers
    if (!text.includes(startMarker) && !text.includes(endMarker) && !isCapturingExecutionPlan) {
      // Look for "📋 Execution Plan:" followed by content until a new section starts
      const executionPlanPattern = /📋\s*Execution\s*Plan:\s*(.*?)(?=\n\n(?:[A-Z]|###)|Calling|Checking|$)/is;
      const match = text.match(executionPlanPattern);
      
      if (match && match[1]) {
        console.log('🔧 FALLBACK: Found execution plan content without Unicode markers!');
        const executionPlanText = match[1].trim();
        console.log('🔧 FALLBACK: Extracted execution plan:', executionPlanText.substring(0, 200) + '...');
        
        // Remove the entire execution plan section from main content
        const fullExecutionPlanSection = match[0];
        mainContent = text.replace(fullExecutionPlanSection, '').trim();
        executionPlanContent = executionPlanText;
        shouldStartCapturing = true;
        shouldStopCapturing = true; // It's a complete plan in one chunk
        
        console.log('🔧 FALLBACK: Removed section:', fullExecutionPlanSection.substring(0, 100) + '...');  
        console.log('🔧 FALLBACK: Main content after removal:', mainContent.substring(0, 200) + '...');
        return {
          mainContent,
          executionPlanContent,
          shouldStartCapturing,
          shouldStopCapturing,
        };
      }
    }

    // Check for start marker (⧨)
    if (text.includes(startMarker)) {
      console.log('⧨ FOUND START MARKER');
      shouldStartCapturing = true;
      const parts = text.split(startMarker);
      mainContent = parts[0]; // Content before start marker goes to main

      // Content after start marker might contain execution plan
      if (parts[1]) {
        const afterStart = parts[1];
        if (afterStart.includes(endMarker)) {
          // Both start and end in same chunk
          console.log('⧨⧩ FOUND BOTH MARKERS IN SAME CHUNK');
          const endParts = afterStart.split(endMarker);
          executionPlanContent = endParts[0]; // Content between markers
          mainContent += endParts[1] || ''; // Content after end marker goes to main
          shouldStopCapturing = true;
        } else {
          // Only start marker, content continues in next chunks
          console.log('⧨ FOUND START MARKER ONLY - continuing capture');
          executionPlanContent = afterStart;
        }
      }
    } else if (text.includes(endMarker)) {
      // End marker found (⧩)
      console.log('⧩ FOUND END MARKER');
      shouldStopCapturing = true;
      const parts = text.split(endMarker);
      executionPlanContent = parts[0]; // Content before end marker is execution plan
      mainContent = parts[1] || ''; // Content after end marker goes to main
    } else if (isCapturingExecutionPlan) {
      // We're in the middle of capturing an execution plan
      console.log('⧨...⧩ CONTINUING CAPTURE OF EXECUTION PLAN');
      executionPlanContent = text;
      mainContent = ''; // Nothing goes to main content
    }

    // Clean up execution plan content by removing duplicate headers
    if (executionPlanContent) {
      console.log('BEFORE HEADER CLEANUP:', executionPlanContent.substring(0, 200));
      const originalLength = executionPlanContent.length;
      // Remove "## 📋 Execution Plan" or "📋 Execution Plan" from the beginning
      executionPlanContent = executionPlanContent.replace(/^[\s]*#{0,3}\s*📋\s*Execution\s*Plan[\s]*\n?/i, '').trim();
      console.log('AFTER HEADER CLEANUP:', executionPlanContent.substring(0, 200));
      console.log('HEADER CLEANUP - removed chars:', originalLength - executionPlanContent.length);
    }

    console.log('PROCESSING RESULT - mainContent length:', mainContent.length, 'executionPlanContent length:', executionPlanContent?.length || 0);

    return {
      mainContent,
      executionPlanContent,
      shouldStartCapturing,
      shouldStopCapturing,
    };
  }, [isCapturingExecutionPlan]);

  // Token authentication for external system integration
  const { tokenMessage, isTokenRequest } = useTokenAuthentication();

  const chatbotApi = useMemo(() => {
    try {
      const api = new ChatbotApi(
        backendUrl,
        { identityApi },
        { requestTimeout },
      );
      setApiError(null);
      return api;
    } catch (error) {
      setApiError('Failed to initialize chat service');
      return null;
    }
  }, [backendUrl, identityApi, requestTimeout]);

  // Check agent connection status
  useEffect(() => {
    const checkConnection = async () => {
      if (!chatbotApi) {
        setConnectionStatus('disconnected');
        return;
      }

      setConnectionStatus('checking');
      try {
        // Try to get the agent card to verify connection
        await chatbotApi.getSkillExamples();
        setConnectionStatus('connected');
        setApiError(null);
      } catch (error: any) {
        setConnectionStatus('disconnected');
        setApiError(
          error.message ||
            'Unable to connect to agent service. Please check the configuration.',
        );
      }
    };

    checkConnection();
  }, [chatbotApi]);

  // Get current session
  const currentSession = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: ChatStorage = JSON.parse(stored);
        const sessionsWithDates = data.sessions.map(s => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        }));
        setSessions(sessionsWithDates);
        setCurrentSessionId(data.currentSessionId);
      } else {
        // Only create initial session if no stored data exists
        const initialSession: ChatSession = {
          id: uuidv4(),
          title: 'Chat 1',
          messages: [
            {
              text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
              isUser: false,
              timestamp: createTimestamp(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSessions([initialSession]);
        setCurrentSessionId(initialSession.id);
      }
    } catch (error) {
      alertApi.post({
        message: 'Failed to load chat history. Starting with a fresh session.',
        severity: 'warning',
      });
    }
  }, [botName, alertApi]);

  // Save chat history to localStorage whenever they change
  useEffect(() => {
    try {
      const data: ChatStorage = {
        sessions,
        currentSessionId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // console.warn('Failed to save chat history to storage:', error);
    }
  }, [sessions, currentSessionId]);

  // Create new session
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `Chat ${sessions.length + 1}`,
      messages: [
        {
          text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
          isUser: false,
          timestamp: createTimestamp(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSuggestions(initialSuggestions);
  }, [sessions.length, botName, initialSuggestions]);

  // Switch to session
  const switchToSession = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      // Always keep suggestions visible
      setSuggestions(initialSuggestions);
    },
    [initialSuggestions],
  );

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setCurrentSessionId(
          remainingSessions.length > 0 ? remainingSessions[0].id : null,
        );
      }
    },
    [sessions, currentSessionId],
  );

  // Remove this useEffect since we handle initial session creation in the load effect

  // Add message to current session
  const addMessageToSession = useCallback(
    (message: Message) => {
      if (!currentSessionId) return;

      setSessions(prev =>
        prev.map(session => {
          if (session.id === currentSessionId) {
            const updatedMessages = [
              ...session.messages,
              { ...message, timestamp: createTimestamp() },
            ];
            return {
              ...session,
              messages: updatedMessages,
              updatedAt: new Date(),
              // Update title based on first user message
              title:
                session.messages.length === 1 && message.isUser
                  ? message.text?.substring(0, 50) +
                      (message.text && message.text.length > 50 ? '...' : '') ||
                    session.title
                  : session.title,
            };
          }
          return session;
        }),
      );
    },
    [currentSessionId],
  );

  // Message streaming functions
  const addStreamingMessage = useCallback(
    (initialText: string = '') => {
      const newMessage: Message = {
        text: initialText,
        isUser: false,
        timestamp: createTimestamp(),
        isStreaming: true,
        executionPlan: '', // Explicitly set empty execution plan for new messages
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('➕ ADDED NEW STREAMING MESSAGE - executionPlan set to empty string, timestamp:', newMessage.timestamp);
      }
      addMessageToSession(newMessage);
    },
    [addMessageToSession],
  );

  const updateStreamingMessage = useCallback(
    (text: string, executionPlan?: string, isStreaming: boolean = true) => {
      if (!currentSessionId) return;

      if (process.env.NODE_ENV === 'development') {
        console.log('📝 UPDATE STREAMING MESSAGE - executionPlan:', executionPlan ? `${executionPlan.length} chars - "${executionPlan.substring(0, 30)}..."` : 'undefined/empty');
        console.log('📝 UPDATE STREAMING MESSAGE - text length:', text.length);
      }

      setSessions(prev =>
        prev.map(session => {
          if (session.id === currentSessionId) {
            const updatedMessages = [...session.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && !lastMessage.isUser) {
              lastMessage.text = text;
              lastMessage.isStreaming = isStreaming;
              // Always set execution plan to clear old values - use empty string if not provided
              const previousExecutionPlan = lastMessage.executionPlan;
              lastMessage.executionPlan = executionPlan || '';
              if (process.env.NODE_ENV === 'development') {
                console.log('📝 SET EXECUTION PLAN ON MESSAGE:');
                console.log('📝   - Previous:', previousExecutionPlan ? `"${previousExecutionPlan.substring(0, 50)}..."` : 'empty');
                console.log('📝   - New:', executionPlan ? `"${executionPlan.substring(0, 50)}..."` : 'empty');
                console.log('📝   - OVERWRITING:', previousExecutionPlan && !executionPlan ? '⚠️ YES - CLEARING EXISTING PLAN!' : '✅ No');
              }
            }
            return { ...session, messages: updatedMessages };
          }
          return session;
        }),
      );
    },
    [currentSessionId],
  );


  const finishStreamingMessage = useCallback(() => {
    // Mark the last message as not streaming to trigger execution plan auto-collapse
    if (currentSessionId) {
      setSessions(prev =>
        prev.map(session => {
          if (session.id === currentSessionId) {
            const updatedMessages = [...session.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage && !lastMessage.isUser) {
              lastMessage.isStreaming = false;
            }
            return { ...session, messages: updatedMessages };
          }
          return session;
        }),
      );
    }
    setIsTyping(false);
  }, [currentSessionId]);

  // Main message submission handler
  const handleMessageSubmit = useCallback(
    async (messageText?: string) => {
      const inputText = messageText || userInput.trim();
      if (!inputText) return;

      // Auto-create session if none exist
      let sessionToUse = currentSessionId;
      if (sessions.length === 0 || !currentSessionId) {
        const newSessionId = uuidv4();
        const newSession: ChatSession = {
          id: newSessionId,
          title:
            inputText.length > 50
              ? `${inputText.substring(0, 50)}...`
              : inputText,
          messages: [
            {
              text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
              isUser: false,
              timestamp: createTimestamp(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSessions([newSession]);
        setCurrentSessionId(newSessionId);
        sessionToUse = newSessionId;
      }

      const userMessage: Message = {
        text: inputText,
        isUser: true,
        timestamp: createTimestamp(),
      };

      // Add message to the correct session (either current or newly created)
      setSessions(prev =>
        prev.map(session => {
          if (session.id === sessionToUse) {
            const updatedMessages = [
              ...session.messages,
              { ...userMessage, timestamp: createTimestamp() },
            ];
            return {
              ...session,
              messages: updatedMessages,
              updatedAt: new Date(),
              // Update title based on first user message if it's a new session
              title:
                session.messages.length === 1 && userMessage.isUser
                  ? userMessage.text?.substring(0, 50) +
                      (userMessage.text && userMessage.text.length > 50
                        ? '...'
                        : '') || session.title
                  : session.title,
            };
          }
          return session;
        }),
      );
      setUserInput('');
      setIsTyping(true);
      
      // Keep suggestions visible

      if (!chatbotApi) {
        setSessions(prev =>
          prev.map(session => {
            if (session.id === sessionToUse) {
              return {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    text: `🚫 **${botName} Multi-Agent System Disconnected**\n\nI'm unable to connect to the ${botName} Multi-Agent System at this time. Please check your configuration and try again.`,
                    isUser: false,
                    timestamp: createTimestamp(),
                  },
                ],
                updatedAt: new Date(),
              };
            }
            return session;
          }),
        );
        setIsTyping(false);
        return;
      }

      try {
        // Get the session we're working with (either current or newly created)
        const workingSession =
          sessions.find(s => s.id === sessionToUse) ||
          (sessionToUse === currentSessionId ? currentSession : null);

        // Use real-time SSE streaming if enabled
        if (enableStreaming) {
          try {
            console.log('ATTEMPTING STREAMING...');
            // Add streaming message placeholder
            addStreamingMessage();

            let lastContextId: string | undefined;
            let accumulatedText = '';

            // Clear execution plan state at the start of each new response
            setIsCapturingExecutionPlan(false);
            setAccumulatedExecutionPlan('');
            console.log('🧹 CLEARED EXECUTION PLAN STATE FOR NEW MESSAGE - starting fresh');

            // Stream responses in real-time using SSE
            for await (const event of chatbotApi.submitA2ATaskStream(
              !workingSession?.contextId,
              inputText,
              workingSession?.contextId,
            )) {
            // Update contextId from any event that has it
            if (event.kind === 'task' && event.contextId) {
              lastContextId = event.contextId;
            } else if (event.contextId) {
              lastContextId = event.contextId;
            }

            // Handle different event types
            if (event.kind === 'message' && event.role === 'agent') {
              // Accumulate text from agent messages
              const textPart = event.parts?.find((p: any) => p.kind === 'text');
              if (textPart && 'text' in textPart) {
                console.log('💬 AGENT MESSAGE - text:', textPart.text.substring(0, 200) + (textPart.text.length > 200 ? '...' : ''));
                
                // 🚨 DEBUGGING: Check if agent message contains execution plan content
                if (textPart.text.includes('⧨') || textPart.text.includes('⧩')) {
                  console.log('🎯 EXECUTION PLAN MARKERS IN AGENT MESSAGE!');
                } else if (textPart.text.toLowerCase().includes('task:') || textPart.text.toLowerCase().includes('approach:')) {
                  console.log('🔍 POTENTIAL EXECUTION PLAN IN AGENT MESSAGE WITHOUT MARKERS:');
                  console.log('🔍 TEXT:', textPart.text);
                }
                
                accumulatedText += textPart.text;
                updateStreamingMessage(accumulatedText, accumulatedExecutionPlan || '', true);
              }
            } else if (event.kind === 'artifact-update') {
              // Handle artifact updates (results from sub-agents)
              if (event.artifact && event.artifact.parts) {
                const textPart = event.artifact.parts.find(
                  (p: any) => p.kind === 'text',
                );
                if (textPart && 'text' in textPart) {
                  const { isToolNotification, operation, isStart } = detectToolNotification(event.artifact);
                  
                  console.log('ARTIFACT UPDATE - name:', event.artifact?.name, 'append:', event.append, 'text:', textPart.text.substring(0, 200) + (textPart.text.length > 200 ? '...' : ''), 'isToolNotification:', isToolNotification);
                  
                  // 🚨 DEBUGGING: Check if this content contains execution plan markers
                  if (textPart.text.includes('⧨') || textPart.text.includes('⧩')) {
                    console.log('🎯 EXECUTION PLAN MARKERS DETECTED IN STREAMING CONTENT!');
                    console.log('🎯 FULL TEXT:', textPart.text);
                  } else if (textPart.text.toLowerCase().includes('task:') || textPart.text.toLowerCase().includes('approach:')) {
                    console.log('🔍 POTENTIAL EXECUTION PLAN CONTENT WITHOUT MARKERS:');
                    console.log('🔍 TEXT:', textPart.text.substring(0, 300) + '...');
                    console.log('🔍 This should have ⧨⧩ markers around it!');
                  }
                  
                  // 🔧 NEW LOGIC: Check for execution plan markers in execution_plan artifacts
                  if (event.artifact?.name === 'execution_plan') {
                    const markerText = textPart.text.trim();
                    console.log('🎯 EXECUTION PLAN ARTIFACT:', markerText);
                    
                    if (markerText === '⧨') {
                      console.log('⧨ EXECUTION PLAN START MARKER - Begin capturing streaming_result');
                      setIsCapturingExecutionPlan(true);
                      setAccumulatedExecutionPlan(''); // Reset execution plan content
                    } else if (markerText === '⧩') {
                      console.log('⧩ EXECUTION PLAN END MARKER - Stop capturing streaming_result');
                      setIsCapturingExecutionPlan(false);
                    }
                    
                    // Don't process execution_plan artifacts as regular content
                    console.log('Execution plan marker processed, continuing stream...');
                  } else if (isToolNotification) {
                    // Handle tool notifications ONLY as thinking indicators - never add to content
                    console.log('TOOL NOTIFICATION DETECTED:', operation, 'isStart:', isStart);
                    console.log('Setting currentOperation to:', operation);
                    
                    // Cache the exact notification text for later removal from content
                    const notificationText = textPart.text.trim();
                    
                    // 🚨 DEBUGGING: Check if we're accidentally caching execution plan markers
                    if (notificationText.includes('⧨') || notificationText.includes('⧩')) {
                      console.log('🚨 WARNING: Tool notification contains execution plan markers!');
                      console.log('🚨 NOTIFICATION TEXT:', notificationText);
                      console.log('🚨 This might be why execution plan is getting eaten up!');
                    }
                    
                    toolNotificationsCache.current.add(notificationText);
                    console.log('CACHED NOTIFICATION:', notificationText.substring(0, 100) + (notificationText.length > 100 ? '...' : ''));
                    console.log('CACHE SIZE:', toolNotificationsCache.current.size);
                    
                    // Always update the current operation and stay in operational mode
                    // This handles both start and end notifications
                    setCurrentOperation(operation || 'Processing...');
                    setIsInOperationalMode(true);
                    console.log('Tool notification processed, continuing stream...');
                    // Skip adding tool notifications to accumulated text but continue processing stream
                  } else {
                    // Handle real content (streaming_result) - exit operational mode and accumulate text
                    if (isInOperationalMode) {
                      console.log('EXITING OPERATIONAL MODE - real content detected');
                      setIsInOperationalMode(false);
                      setCurrentOperation(null);
                    }
                    
                    // Only process content if it's NOT a tool notification
                    if (event.artifact?.name !== 'tool_notification_start' && 
                        event.artifact?.name !== 'tool_notification_end') {
                      
                      // Remove any cached tool notifications from the content
                      let cleanText = removeCachedToolNotifications(textPart.text);
                      console.log('CONTENT AFTER CACHE CLEANING - original:', textPart.text.substring(0, 100) + '...', 'cleaned:', cleanText.substring(0, 100) + '...');
                      
                      // 🔧 NEW SIMPLE LOGIC: Route streaming_result based on capture state
                      if (isCapturingExecutionPlan) {
                        // We're capturing execution plan - add this content to execution plan
                        console.log('📋 CAPTURING FOR EXECUTION PLAN:', cleanText.substring(0, 100) + '...');
                        setAccumulatedExecutionPlan(prev => {
                          const newContent = prev + cleanText;
                          console.log('📋 EXECUTION PLAN UPDATED from:', prev.substring(0, 50) + '...', 'to:', newContent.substring(0, 50) + '...');
                          return newContent;
                        });
                        
                        // Don't add to main content - this is execution plan content
                        cleanText = '';
                      } else {
                        // Normal mode - add to main content
                        console.log('📄 ADDING TO MAIN CONTENT:', cleanText.substring(0, 100) + '...');
                      }

                      // Get current execution plan content for message update
                      const currentExecutionPlan = accumulatedExecutionPlan;
                      
                      // Respect the append flag for proper text accumulation
                      if (event.append === false) {
                        // Start fresh with new text
                        console.log('STARTING FRESH - clearing previous text');
                        accumulatedText = cleanText;
                      } else {
                        // Append to existing text with smart spacing
                        console.log('APPENDING to existing text');
                        
                        // Add spacing logic to prevent words from running together
                        if (accumulatedText && cleanText) {
                          const lastChar = accumulatedText.slice(-1);
                          const firstChar = cleanText.slice(0, 1);
                          
                          // Add space if both are alphanumeric and no space exists
                          if (/[a-zA-Z0-9]/.test(lastChar) && /[a-zA-Z0-9]/.test(firstChar)) {
                            // Don't add space if the new text already starts with punctuation or whitespace
                            if (!/[\s.,!?;:]/.test(firstChar)) {
                              accumulatedText += ' ' + cleanText;
                            } else {
                              accumulatedText += cleanText;
                            }
                          } else {
                            accumulatedText += cleanText;
                          }
                        } else {
                          accumulatedText += cleanText;
                        }
                      }

                      // Always update message to keep execution plan and main content separated
                      if (process.env.NODE_ENV === 'development') {
                        console.log('ACCUMULATED TEXT:', accumulatedText.substring(0, 100) + '...');
                        console.log('ACCUMULATED EXECUTION PLAN:', accumulatedExecutionPlan);
                        console.log('⧨⧩ UPDATING MESSAGE WITH EXECUTION PLAN:', currentExecutionPlan ? 'YES' : 'NO');
                      }

                      // 🔧 SIMPLE FIX: Use current execution plan content
                      const executionPlanToPass = currentExecutionPlan || '';
                      if (process.env.NODE_ENV === 'development') {
                        console.log('⧨⧩ EXECUTION PLAN TO PASS:', executionPlanToPass ? `"${executionPlanToPass.substring(0, 50)}..."` : 'EMPTY STRING');
                        console.log('⧨⧩ CURRENT currentExecutionPlan:', currentExecutionPlan ? `"${currentExecutionPlan.substring(0, 50)}..."` : 'EMPTY');
                        console.log('⧨⧩ STATE accumulatedExecutionPlan:', accumulatedExecutionPlan ? `"${accumulatedExecutionPlan.substring(0, 50)}..."` : 'EMPTY');
                        console.log('⧨⧩ isCapturingExecutionPlan STATE:', isCapturingExecutionPlan);
                      }
                      updateStreamingMessage(accumulatedText, executionPlanToPass, true);
                    }
                  }
                }
              }
            } else if (event.kind === 'status-update') {
              // Only handle status changes, don't process text content (to avoid duplication)
              // Text content is already handled in artifact-update events
              
              // Check if task is completed
              if (event.status?.state === 'completed' || event.final) {
                break;
              }
            } else if (event.kind === 'task') {
              // Handle artifacts (final results from sub-agents)
              if (event.artifacts && event.artifacts.length > 0) {
                // Look for 'final_result' artifact first, otherwise use the last artifact
                const finalArtifact =
                  event.artifacts.find(a => a.name === 'final_result') ||
                  event.artifacts[event.artifacts.length - 1];

                if (finalArtifact && finalArtifact.parts) {
                  const textPart = finalArtifact.parts.find(
                    (p: any) => p.kind === 'text',
                  );
                  if (textPart && 'text' in textPart) {
                    accumulatedText = textPart.text;
                    updateStreamingMessage(accumulatedText, accumulatedExecutionPlan || '', true);
                  }
                }
              }
              // Otherwise, process task history if available
              else if (event.history && event.history.length > 0) {
                const newText: string[] = [];
                for (const historyMsg of event.history) {
                  if (historyMsg.role === 'agent') {
                    const textPart = historyMsg.parts?.find(
                      (p: any) => p.kind === 'text',
                    );
                    if (textPart && 'text' in textPart) {
                      // Remove any cached tool notifications from history
                      const cleanText = removeCachedToolNotifications(textPart.text);
                      console.log('HISTORY MSG AFTER CACHE CLEANING - original:', textPart.text, 'cleaned:', cleanText);
                      
                      if (cleanText.trim()) {
                        // Only add non-empty cleaned text
                        newText.push(cleanText);
                      }
                    }
                  }
                }
                const fullText = newText.join('');
                if (fullText.length > accumulatedText.length) {
                  accumulatedText = fullText;
                  // 🔧 FIX: Pass accumulated execution plan to preserve it
                  console.log('🔧 NON-STREAMING UPDATE - preserving accumulatedExecutionPlan:', accumulatedExecutionPlan);
                  updateStreamingMessage(accumulatedText, accumulatedExecutionPlan || '', true);
                }
              }

              // Check task status
              if (
                event.status?.state === 'completed' ||
                event.status?.state === 'failed' ||
                event.status?.state === 'rejected'
              ) {
                break;
              }
            }
          }

          // Update session with contextId
          if (lastContextId && sessionToUse) {
            setSessions(prev =>
              prev.map(session =>
                session.id === sessionToUse
                  ? { ...session, contextId: lastContextId }
                  : session,
              ),
            );
          }

            // Finish streaming and cleanup operational state
            finishStreamingMessage();
            setIsTyping(false);
            setIsInOperationalMode(false);
            setCurrentOperation(null);
            return;
          } catch (streamingError) {
            console.error('STREAMING FAILED, FALLING BACK TO NON-STREAMING:', streamingError);
            // Clean up any streaming UI state including operational mode
            setIsInOperationalMode(false);
            setCurrentOperation(null);
            setIsTyping(true); // Reset typing state for non-streaming fallback
          }
        }

        // Non-streaming mode: submit task and wait for response
        const taskResult = await chatbotApi.submitA2ATask(
          !workingSession?.contextId,
          inputText,
          workingSession?.contextId,
        );

        // Update session with contextId for continuity
        if (taskResult.contextId && sessionToUse) {
          setSessions(prev =>
            prev.map(session =>
              session.id === sessionToUse
                ? { ...session, contextId: taskResult.contextId }
                : session,
            ),
          );
        }

        // Handle streaming response from history array
        let resultText = '';
        let executionPlanText = '';
        if (taskResult.status.state === 'completed' && taskResult.artifacts) {
          // Look for 'final_result' artifact first, otherwise use the last artifact
          const finalArtifact =
            taskResult.artifacts.find(a => a.name === 'final_result') ||
            taskResult.artifacts[taskResult.artifacts.length - 1];

          if (finalArtifact && finalArtifact.parts && finalArtifact.parts[0]) {
            const part = finalArtifact.parts[0];
            if (part.kind === 'text') {
              // Process execution plan markers in non-streaming response
              const { mainContent, executionPlanContent } = processExecutionPlanMarkers(part.text);
              resultText = mainContent;
              if (executionPlanContent) {
                executionPlanText = executionPlanContent;
              }
            }
          }
        } else if (taskResult.status.message) {
          // For completed/failed/rejected states: use status.message
          // For working/submitted states: skip to process history instead
          const useStatusMessage =
            taskResult.status.state === 'completed' ||
            taskResult.status.state === 'failed' ||
            taskResult.status.state === 'rejected' ||
            taskResult.status.state === 'canceled' ||
            taskResult.status.state === 'auth-required';

          if (useStatusMessage) {
            const part = taskResult.status.message.parts[0];
            if (part.kind === 'text') {
              // Process execution plan markers in status message
              const { mainContent, executionPlanContent } = processExecutionPlanMarkers(part.text);
              resultText = mainContent;
              if (executionPlanContent) {
                executionPlanText = executionPlanContent;
              }
            }
          }
        }

        // If no text from status/artifacts, collect from streaming history
        // This handles "working" and "submitted" states where we need to show accumulated history
        if (
          !resultText &&
          taskResult.history &&
          taskResult.history.length > 0
        ) {
          // Find the last user message
          let lastUserIndex = -1;
          for (let i = taskResult.history.length - 1; i >= 0; i--) {
            if (taskResult.history[i].role === 'user') {
              lastUserIndex = i;
              break;
            }
          }

          // Collect all agent messages after the last user message (excluding tool notifications)
          const agentWords = [];
          if (lastUserIndex >= 0) {
            for (
              let i = lastUserIndex + 1;
              i < taskResult.history.length;
              i++
            ) {
              const message = taskResult.history[i];
              if (
                message.role === 'agent' &&
                message.parts &&
                message.parts[0] &&
                message.parts[0].kind === 'text'
              ) {
                // Filter out tool notifications from non-streaming history too
                const text = message.parts[0].text;
                const isToolMessage = /^(🔧 Calling \w+\.\.\.|✅ \w+ completed)$/m.test(text.trim());
                
                console.log('NON-STREAMING HISTORY - text:', text, 'isToolMessage:', isToolMessage);
                
                if (!isToolMessage) {
                  agentWords.push(text);
                } else {
                  console.log('FILTERED OUT TOOL MESSAGE FROM NON-STREAMING HISTORY');
                }
              }
            }
          }

          // Implement streaming display for long responses (>300 words)
          if (agentWords.length > 300) {
            addStreamingMessage();

            let currentText = '';
            agentWords.forEach((word, index) => {
              setTimeout(() => {
                currentText += word;
                updateStreamingMessage(currentText.trim(), '', true);

                // Finish streaming on last word
                if (index === agentWords.length - 1) {
                  setTimeout(() => {
                    finishStreamingMessage();
                  }, 50);
                }
              }, index * 10); // delay (milliseconds) between words
            });
            return; // Exit early - isTyping will be set to false by finishStreamingMessage
          }

          // Fallback: join all words if no streaming and process execution plan markers
          const joinedText = agentWords.join('').trim();
          const { mainContent, executionPlanContent } = processExecutionPlanMarkers(joinedText);
          resultText = mainContent;
          if (executionPlanContent) {
            executionPlanText = executionPlanContent;
          }
        }

        // Add message normally if not streaming - include execution plan if present
        if (resultText || executionPlanText) {
          const newMessage = {
            text: resultText || '',
            isUser: false,
            timestamp: createTimestamp(),
            executionPlan: executionPlanText || '', // Use empty string instead of undefined
            isStreaming: false, // Mark as completed for auto-collapse
          };
          console.log('📝 NON-STREAMING MESSAGE CREATED:', {
            textLength: newMessage.text.length,
            executionPlanLength: newMessage.executionPlan?.length || 0,
            timestamp: newMessage.timestamp
          });

          setSessions(prev =>
            prev.map(session => {
              if (session.id === sessionToUse) {
                return {
                  ...session,
                  messages: [
                    ...session.messages,
                    newMessage,
                  ],
                  updatedAt: new Date(),
                };
              }
              return session;
            }),
          );
        }
        setIsTyping(false); // Set to false for non-streaming responses
      } catch (error) {
        const err = error as Error;
        setApiError(err.message);

        // Check if it's a timeout error and display it directly without additional prefix
        const isTimeoutError = err.message.includes('timed out');
        const errorMessage = isTimeoutError
          ? `⏱️ ${err.message}`
          : `🚫 **${botName} Multi-Agent System Disconnected**\n\nError: ${err.message}`;

        setSessions(prev =>
          prev.map(session => {
            if (session.id === sessionToUse) {
              return {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    text: errorMessage,
                    isUser: false,
                    timestamp: createTimestamp(),
                  },
                ],
                updatedAt: new Date(),
              };
            }
            return session;
          }),
        );
        setIsTyping(false); // Always set to false on error
      }
    },
    [
      userInput,
      chatbotApi,
      botName,
      currentSession,
      currentSessionId,
      addStreamingMessage,
      updateStreamingMessage,
      finishStreamingMessage,
      sessions,
      setSessions,
      setCurrentSessionId,
      enableStreaming,
      processExecutionPlanMarkers,
      setIsCapturingExecutionPlan,
      setAccumulatedExecutionPlan,
      accumulatedExecutionPlan,
      isCapturingExecutionPlan,
    ],
  );

  const handleSuggestionClick = (suggestion: string) => {
    handleMessageSubmit(suggestion);
  };

  const resetChat = () => {
    if (currentSessionId) {
      setSessions(prev =>
        prev.map(session =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [
                  {
                    text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`,
                    isUser: false,
                    timestamp: createTimestamp(),
                  },
                ],
                contextId: undefined, // Reset context
                updatedAt: new Date(),
              }
            : session,
        ),
      );
    }
    setUserInput('');
    setSuggestions(initialSuggestions);
    setApiError(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => (
    <Grid container spacing={1} className={classes.mainContent} wrap="nowrap">
      {/* Chat History Sidebar */}
      <Grid
        item
        className={classes.sidebarColumn}
        style={
          isSidebarCollapsed
            ? { flexShrink: 0, width: 'auto' }
            : { flexShrink: 0, width: 'auto', minWidth: 250, maxWidth: 300 }
        }
      >
        <ChatSessionSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionSwitch={switchToSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
          onCollapseChange={setIsSidebarCollapsed}
          sidebarTextFontSize={fontSizes.sidebarText}
          isCollapsed={isSidebarCollapsed}
        />
      </Grid>

      {/* Main Chat Area */}
      <Grid item className={classes.chatColumn}>
        {apiError && (
          <Paper className={classes.errorBox}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Typography
                variant="subtitle2"
                style={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                Connection Error
              </Typography>
              <IconButton
                size="small"
                onClick={() => setApiError(null)}
                style={{ color: 'inherit', padding: 2 }}
                title="Dismiss"
              >
                ×
              </IconButton>
            </div>
            <Typography
              variant="body2"
              style={{
                marginBottom: 6,
                fontSize: '0.8125rem',
                lineHeight: 1.3,
              }}
            >
              {apiError}
            </Typography>
            <Button
              size="small"
              startIcon={<RefreshIcon style={{ fontSize: '1rem' }} />}
              onClick={() => window.location.reload()}
              variant="outlined"
              style={{
                color: 'inherit',
                borderColor: 'currentColor',
                fontSize: '0.8125rem',
                padding: '4px 10px',
              }}
            >
              Retry Connection
            </Button>
          </Paper>
        )}

        {isTokenRequest && tokenMessage && (
          <Card style={{ marginBottom: 16 }}>
            <CardContent>
              <Typography variant="h6">Authentication</Typography>
              <Typography variant="body2">{tokenMessage}</Typography>
            </CardContent>
          </Card>
        )}

        <Card className={classes.chatCard}>
          <CardContent className={classes.chatCardContent}>
            <PageHeader botName={botName} botIcon={botIcon} />

            <ChatContainer
              messages={currentSession?.messages || []}
              userInput={userInput}
              setUserInput={setUserInput}
              onMessageSubmit={handleMessageSubmit}
              onSuggestionClick={handleSuggestionClick}
              onReset={resetChat}
              isTyping={isTyping}
              suggestions={suggestions}
              thinkingMessages={thinkingMessages}
              thinkingMessagesInterval={thinkingMessagesInterval}
              botName={botName}
              botIcon={botIcon}
              inputPlaceholder={inputPlaceholder}
              currentOperation={currentOperation}
              isInOperationalMode={isInOperationalMode}
              fontSizes={{
                messageText: fontSizes.messageText,
                codeBlock: fontSizes.codeBlock,
                inlineCode: fontSizes.inlineCode,
                suggestionChip: fontSizes.suggestionChip,
                inputField: fontSizes.inputField,
                timestamp: fontSizes.timestamp,
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (isFullscreen) {
    return (
      <div className={classes.fullscreenContainer}>
        <Box className={classes.customHeaderContainer}>
          <Box className={classes.customHeaderLeft}>
            {botIcon && (
              <img
                src={botIcon}
                alt={botName}
                className={classes.headerBotAvatar}
              />
            )}
            <Tooltip title="Visit CAIPE Documentation" placement="bottom">
              <Box className={classes.customHeaderTextContainer}>
                <Typography
                  variant="h5"
                  className={classes.headerTitle}
                  style={{ fontSize: fontSizes.headerTitle }}
                >
                  {headerTitle}
                </Typography>
                <Typography
                  variant="body2"
                  className={classes.headerSubtitle}
                  component="a"
                  href="https://cnoe-io.github.io/ai-platform-engineering/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: fontSizes.headerSubtitle,
                  }}
                >
                  {headerSubtitle}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
          <Box className={classes.customHeaderRight}>
            <Tooltip title={`Agent URL: ${backendUrl}`} placement="bottom">
              <Box className={classes.customHeaderStatus}>
                <Typography className={classes.customHeaderLabel}>
                  Status
                </Typography>
                <Typography className={classes.customHeaderValue}>
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'checking' && 'Connecting...'}
                  {connectionStatus === 'disconnected' && 'Disconnected'}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip
              title="View on NPM: @caipe/plugin-agent-forge"
              placement="bottom"
            >
              <Box
                className={classes.customHeaderStatus}
                onClick={() =>
                  window.open(
                    'https://www.npmjs.com/package/@caipe/plugin-agent-forge',
                    '_blank',
                  )
                }
                style={{ cursor: 'pointer' }}
              >
                <Typography className={classes.customHeaderLabel}>
                  Plugin Version
                </Typography>
                <Typography className={classes.customHeaderValue}>
                  v{packageInfo.version}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Exit Fullscreen">
              <IconButton
                onClick={toggleFullscreen}
                className={classes.fullscreenButton}
              >
                <FullscreenExitIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <div className={classes.fullscreenContent}>{renderContent()}</div>
      </div>
    );
  }

  return (
    <>
      <Box className={classes.customHeaderContainer}>
        <Box className={classes.customHeaderLeft}>
          {botIcon && (
            <img
              src={botIcon}
              alt={botName}
              className={classes.headerBotAvatar}
            />
          )}
          <Tooltip title="Visit CAIPE Documentation" placement="bottom">
            <Box className={classes.customHeaderTextContainer}>
              <Typography
                variant="h5"
                className={classes.headerTitle}
                style={{ fontSize: fontSizes.headerTitle }}
              >
                {headerTitle}
              </Typography>
              <Typography
                variant="body2"
                className={classes.headerSubtitle}
                component="a"
                href="https://cnoe-io.github.io/ai-platform-engineering/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontSize: fontSizes.headerSubtitle,
                }}
              >
                {headerSubtitle}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        <Box className={classes.customHeaderRight}>
          <Tooltip title={`Agent URL: ${backendUrl}`} placement="bottom">
            <Box className={classes.customHeaderStatus}>
              <Typography className={classes.customHeaderLabel}>
                Status
              </Typography>
              <Typography className={classes.customHeaderValue}>
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'checking' && 'Connecting...'}
                {connectionStatus === 'disconnected' && 'Disconnected'}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip
            title="View on NPM: @caipe/plugin-agent-forge"
            placement="bottom"
          >
            <Box
              className={classes.customHeaderStatus}
              onClick={() =>
                window.open(
                  'https://www.npmjs.com/package/@caipe/plugin-agent-forge',
                  '_blank',
                )
              }
              style={{ cursor: 'pointer' }}
            >
              <Typography className={classes.customHeaderLabel}>
                Plugin Version
              </Typography>
              <Typography className={classes.customHeaderValue}>
                v{packageInfo.version}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton
              onClick={toggleFullscreen}
              className={classes.fullscreenButton}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box className={classes.pageContainer}>
        <Page themeId="tool">
          <Content noPadding>
            <Box className={classes.contentWrapper}>{renderContent()}</Box>
          </Content>
        </Page>
      </Box>
    </>
  );
}

export default AgentForgePage;
