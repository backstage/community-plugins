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
    borderRadius: theme.spacing(1), // Add slight border radius for better appearance
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
    flexBasis: '20%',
    flexShrink: 0,
    flexGrow: 0,
    maxWidth: '20%',
    transition: 'all 0.3s ease',
  },
  sidebarColumnCollapsed: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexBasis: '60px', // Just enough for the collapse button
    flexShrink: 0,
    flexGrow: 0,
    maxWidth: '60px',
    minWidth: '60px',
    transition: 'all 0.3s ease',
  },
  chatColumn: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexBasis: '80%',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  chatColumnExpanded: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexBasis: 'calc(100% - 60px)', // Take remaining space when sidebar is collapsed
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
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

  // Performance optimization: progressive message loading to prevent DOM bloat  
  const DEFAULT_MESSAGE_COUNT = 5; // Default messages shown (gradual auto-collapse target)
  const LOAD_MORE_INCREMENT = 5; // How many additional messages to load each time
  
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

  // Create initial session factory
  const createInitialSession = useCallback((): ChatSession => ({
    contextId: uuidv4(),
    title: 'Chat 1',
    messages: [
      {
        messageId: uuidv4(),
        text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`.replace(/⟦|⟧/g, ''),
        isUser: false,
        timestamp: createTimestamp(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }), [botName]);

  // Initialize with a default session to prevent loading state
  const [initialSession] = useState(() => {
    const sessionId = uuidv4();
    return {
      contextId: sessionId,
      title: 'Chat 1',
      messages: [
        {
          messageId: uuidv4(),
          text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`.replace(/⟦|⟧/g, ''),
          isUser: false,
          timestamp: createTimestamp(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  
  // Chat session state - start with default session to prevent loading
  const [sessions, setSessions] = useState<ChatSession[]>([initialSession]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(initialSession.contextId);

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
  const [nextRetryCountdown, setNextRetryCountdown] = useState<number>(0);
  const [loadedMessageCount, setLoadedMessageCount] = useState(DEFAULT_MESSAGE_COUNT); // Progressive loading count
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
  const [isManualLoadingInProgress, setIsManualLoadingInProgress] = useState(false);
  const lastScrollPositionRef = useRef<number>(-1);
  const buttonToggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCollapseTimeRef = useRef<number>(0);
  const gracefulScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Execution plan buffer - stores execution plans by message ID (fallback to timestamp)
  const [executionPlanBuffer, setExecutionPlanBuffer] = useState<Record<string, string>>({});
  // Track which execution plans should be auto-expanded when they appear
  const [autoExpandExecutionPlans, setAutoExpandExecutionPlans] = useState<Set<string>>(new Set());
  // Reference to input field for focus management
  const inputRef = useRef<HTMLInputElement>(null);
  // SCROLL MODE: Manual mode by default - users have full control over scroll position
  // TO RE-ENABLE AUTO-SCROLL: Change false to true and uncomment toggle UI in ChatContainer.tsx
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  
  // State for operational thinking messages
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [isInOperationalMode, setIsInOperationalMode] = useState(false);
  
  // Cache to track tool notifications we've shown in thinking indicator
  const toolNotificationsCache = useRef<Set<string>>(new Set());
  
  // State for execution plan processing with request isolation
  const [isCapturingExecutionPlan, setIsCapturingExecutionPlan] = useState(false);
  const [accumulatedExecutionPlan, setAccumulatedExecutionPlan] = useState<string>('');
  const currentRequestIdRef = useRef<string>(''); // Track current streaming request
  const abortControllerRef = useRef<AbortController | null>(null); // Cancel previous streams
  const [executionPlanLoading, setExecutionPlanLoading] = useState<Set<string>>(new Set()); // Track loading state per message
  
  
  // Function to remove cached tool notifications from content
  const removeCachedToolNotifications = useCallback((text: string): string => {
    let cleanText = text;
    const originalText = text;
    
    // 🚨 DEBUGGING: Check if input text contains execution plan markers
    if (text.includes('⟦') || text.includes('⟧')) {
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
      if (beforeRemoval !== cleanText && (beforeRemoval.includes('⟦') || beforeRemoval.includes('⟧'))) {
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
    if (originalText.includes('⟦') || originalText.includes('⟧')) {
      const stillHasMarkers = cleanText.includes('⟦') || cleanText.includes('⟧');
      console.log('🚨 EXECUTION PLAN MARKERS AFTER CLEANING:', stillHasMarkers ? 'STILL PRESENT' : 'REMOVED!');
    }
    
    return cleanText;
  }, []);
  
  
  
  // Utility function to detect and parse tool notifications using metadata
  const detectToolNotification = (artifact: any): { isToolNotification: boolean; operation?: string; isStart?: boolean } => {
    console.log('🆕 NEW CODE RUNNING - detectToolNotification v2.0');
    
    if (!artifact || !artifact.name) {
      return { isToolNotification: false };
    }
    
    // Get the actual text content from artifact parts
    const textContent = artifact.parts?.[0]?.text || '';
    
    console.log('🔍 detectToolNotification - artifact.name:', artifact.name, 'textContent:', textContent);
    
    // Detect tool start notifications: name = "tool_notification_start"
    if (artifact.name === 'tool_notification_start') {
      // Use the actual text content which includes agent name
      // e.g., "🔧 Argocd: Calling tool: Version_Service__Version\n" or "🔧 Supervisor: Calling Agent Argocd...\n"
      const operation = textContent.trim() || `Calling tool...`;
      console.log('🔍 Detected tool_notification_start, operation:', operation);
      return { isToolNotification: true, operation, isStart: true };
    }
    
    // Detect tool end notifications: name = "tool_notification_end"  
    if (artifact.name === 'tool_notification_end') {
      // Use the actual text content which includes agent name
      // e.g., "✅ Argocd: Tool Version_Service__Version completed\n" or "✅ Supervisor: Agent task Argocd completed\n"
      const operation = textContent.trim() || `Tool completed`;
      console.log('🔍 Detected tool_notification_end, operation:', operation);
      return { isToolNotification: true, operation, isStart: false };
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
    const startMarker = '⟦';
    const endMarker = '⟧';

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

    // Check for start marker (⟦)
    if (text.includes(startMarker)) {
      console.log('⟦ FOUND START MARKER');
      shouldStartCapturing = true;
      const parts = text.split(startMarker);
      mainContent = parts[0]; // Content before start marker goes to main

      // Content after start marker might contain execution plan
      if (parts[1]) {
        const afterStart = parts[1];
        if (afterStart.includes(endMarker)) {
          // Both start and end in same chunk
          console.log('⟦⟧ FOUND BOTH MARKERS IN SAME CHUNK');
          const endParts = afterStart.split(endMarker);
          executionPlanContent = endParts[0]; // Content between markers
          mainContent += endParts[1] || ''; // Content after end marker goes to main
          shouldStopCapturing = true;
        } else {
          // Only start marker, content continues in next chunks
          console.log('⟦ FOUND START MARKER ONLY - continuing capture');
          executionPlanContent = afterStart;
        }
      }
    } else if (text.includes(endMarker)) {
      // End marker found (⟧)
      console.log('⟧ FOUND END MARKER');
      shouldStopCapturing = true;
      const parts = text.split(endMarker);
      executionPlanContent = parts[0]; // Content before end marker is execution plan
      mainContent = parts[1] || ''; // Content after end marker goes to main
    } else if (isCapturingExecutionPlan) {
      // We're in the middle of capturing an execution plan
      console.log('⟦...⟧ CONTINUING CAPTURE OF EXECUTION PLAN');
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

  // ChatbotApi state - initialized asynchronously to handle A2A client constructor errors
  const [chatbotApi, setChatbotApi] = useState<any>(null);
  
  // Only initialize ChatbotApi when agent is confirmed reachable
  useEffect(() => {
    // Clear existing API when connection status changes
    if (connectionStatus === 'disconnected' || connectionStatus === 'checking') {
      setChatbotApi(null);
      return;
    }
    
    // Only create ChatbotApi when connected
    if (connectionStatus === 'connected' && backendUrl && !chatbotApi) {
      console.log('🔧 Agent is reachable - initializing ChatbotApi with URL:', backendUrl);
      
      try {
        const api = new ChatbotApi(
          backendUrl,
          { identityApi },
          { requestTimeout },
        );
        
        // Wrap API methods to catch any remaining A2A client exceptions
        const originalSubmitA2ATask = api.submitA2ATask.bind(api);
        const originalSubmitA2ATaskStream = api.submitA2ATaskStream.bind(api);
        
        api.submitA2ATask = async (isNewTask: boolean, message: string, contextId?: string) => {
          try {
            return await originalSubmitA2ATask(isNewTask, message, contextId);
          } catch (error) {
            console.error('🚫 A2A Client exception in submitA2ATask:', error);
            throw error; // Re-throw to maintain existing error handling
          }
        };
        
        api.submitA2ATaskStream = (isNewTask: boolean, message: string, contextId?: string) => {
          try {
            return originalSubmitA2ATaskStream(isNewTask, message, contextId);
          } catch (error) {
            console.error('🚫 A2A Client exception in submitA2ATaskStream:', error);
            throw error; // Re-throw to maintain existing error handling
          }
        };
        
        console.log('✅ ChatbotApi initialized successfully (agent reachable)');
        setChatbotApi(api);
      } catch (error: any) {
        console.error('🚫 Failed to initialize ChatbotApi even when agent appears reachable:', error);
        setChatbotApi(null);
        // Reset connection status if API creation fails
        setConnectionStatus('disconnected');
        setNextRetryCountdown(30);
      }
    }
  }, [connectionStatus, backendUrl, identityApi, requestTimeout, chatbotApi]);

  // Global error handler for A2A client unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error?.message?.includes('Unable to connect to agent') || 
          error?.message?.includes('.well-known/agent.json') ||
          error?.message?.includes('_fetchAndCacheAgentCard')) {
        console.error('🚫 Caught unhandled A2A client promise rejection:', error);
        event.preventDefault(); // Prevent the error from showing in UI
        
        // Set connection status and start retry countdown - banner will show the status
        setConnectionStatus('disconnected');
        setNextRetryCountdown(30);
      }
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      if (error?.message?.includes('Unable to connect to agent') || 
          error?.message?.includes('.well-known/agent.json') ||
          error?.message?.includes('_fetchAndCacheAgentCard')) {
        console.error('🚫 Caught unhandled A2A client error:', error);
        event.preventDefault(); // Prevent the error from showing in UI
        
        // Set connection status and start retry countdown - banner will show the status
        setConnectionStatus('disconnected');
        setNextRetryCountdown(30);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Check agent connection status with periodic polling and countdown
  useEffect(() => {
    const effectId = Math.random().toString(36).substr(2, 9);
    console.log(`🚀 useEffect START (${effectId}) - chatbotApi:`, !!chatbotApi);
    
    let countdownInterval: NodeJS.Timeout | null = null;

    // Lightweight connection check using agent.json endpoint
    const checkAgentHealth = async (agentBaseUrl: string): Promise<boolean> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout
      
      try {
        const agentJsonUrl = `${agentBaseUrl.replace(/\/$/, '')}/.well-known/agent.json`;
        console.log('🔍 Checking agent health at:', agentJsonUrl);
        
        const response = await fetch(agentJsonUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.log('🔴 Agent health check failed - HTTP:', response.status, response.statusText);
          return false;
        }
        
        // Try to parse JSON to ensure it's a valid agent card
        const agentCard = await response.json();
        if (!agentCard || typeof agentCard !== 'object') {
          console.log('🔴 Agent health check failed - Invalid JSON response');
          return false;
        }
        
        console.log('🟢 Agent health check succeeded - Agent card received');
        return true;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.log('🔴 Agent health check failed - Timeout after 15 seconds');
        } else {
          console.log('🔴 Agent health check failed:', error.message);
        }
        return false;
      }
    };

    const checkConnection = async () => {
      console.log('🔄 Starting lightweight connection check...');
      setConnectionStatus('checking'); // Show "Connecting..." status
      setNextRetryCountdown(0); // Reset countdown during check
      
      if (!backendUrl) {
        console.log('🔴 No backend URL available');
        setConnectionStatus('disconnected');
        setNextRetryCountdown(30); // Start countdown even when URL not ready
        console.log('🔴 Set retry countdown to 30 seconds (URL not configured)');
        return;
      }

      try {
        const isHealthy = await checkAgentHealth(backendUrl);
        if (isHealthy) {
          setConnectionStatus('connected');
          setNextRetryCountdown(0); // Clear countdown on success
          setApiError(null); // Clear error message when connection succeeds
          // Stop any running countdown when connected
          if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
          }
        } else {
          throw new Error('Agent health check failed - service may be down or unreachable');
        }
      } catch (error: any) {
        setConnectionStatus('disconnected');
        setNextRetryCountdown(30); // Start 30-second countdown
      }
    };


    // Initial connection check - performance optimized
    checkConnection();

    // Cleanup intervals on unmount
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    };
  }, []); // Run only once on mount - don't recreate when chatbotApi changes

  // Watch for countdown reaching 0 and trigger retry - optimized for performance
  useEffect(() => {
    if (nextRetryCountdown === 0 && connectionStatus === 'disconnected' && backendUrl) {
      const retryConnection = async () => {
        try {
          setConnectionStatus('checking');
          
          // Use the same lightweight health check
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          try {
            const agentJsonUrl = `${backendUrl.replace(/\/$/, '')}/.well-known/agent.json`;
            
            const response = await fetch(agentJsonUrl, {
              method: 'GET',
              signal: controller.signal,
              headers: { 'Accept': 'application/json' },
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            await response.json(); // Validate JSON
            
            setConnectionStatus('connected');
            setApiError(null);
          } catch (healthError: any) {
            clearTimeout(timeoutId);
            throw healthError;
          }
        } catch (error: any) {
          console.log('🔴 RETRY FAILED: Restarting countdown...');
          setConnectionStatus('disconnected');
          setNextRetryCountdown(30);
        }
      };
      
      // Small delay to avoid race conditions
      setTimeout(retryConnection, 200);
    }
  }, [nextRetryCountdown, connectionStatus, backendUrl]);

  // Start countdown timer whenever nextRetryCountdown is set to a positive value
  useEffect(() => {
    if (nextRetryCountdown > 0 && connectionStatus === 'disconnected') {
      console.log(`⏰ NextRetryCountdown changed to ${nextRetryCountdown}, starting timer`);
      // We need to access the startCountdown function, but it's defined inside another useEffect
      // So we'll implement the countdown logic here directly
      const countdownInterval = setInterval(() => {
        setNextRetryCountdown(prev => {
          const newValue = prev <= 1 ? 0 : prev - 1;
          console.log(`⏰ Countdown tick: ${prev} → ${newValue}`);
          return newValue;
        });
      }, 1000);

      return () => {
        console.log('⏰ Clearing countdown interval on cleanup');
        clearInterval(countdownInterval);
      };
    }
    
    // Return undefined for the case where condition is not met
    return undefined;
  }, [nextRetryCountdown, connectionStatus]);

  // Get current session with fallback
  const currentSession = useMemo(() => {
    if (sessions.length === 0) return null;
    
    let session = sessions.find(s => s.contextId === currentSessionId);
    
    // If no session found with currentSessionId, use the first session as fallback
    if (!session && sessions.length > 0) {
      session = sessions[0];
      setCurrentSessionId(sessions[0].contextId);
    }
    
    return session || null;
  }, [sessions, currentSessionId]);

  // Performance optimization: progressive message loading to prevent DOM bloat
  const renderedMessages = useMemo(() => {
    if (!currentSession?.messages) return [];
    
    const messages = currentSession.messages;
    const totalMessages = messages.length;
    
    // Show messages up to the current loaded count
    const messagesToShow = Math.min(loadedMessageCount, totalMessages);
    
    // Get the last 'messagesToShow' messages
    return messages.slice(-messagesToShow);
  }, [currentSession?.messages, loadedMessageCount]);

  // Load more messages handler - progressive loading
  const handleLoadMore = useCallback(() => {
    const newCount = loadedMessageCount + LOAD_MORE_INCREMENT;
    console.log('📥 Loading more messages:', loadedMessageCount, '→', newCount);
    
    // Clear any pending timeouts to ensure immediate hiding and prevent conflicts
    if (buttonToggleTimeoutRef.current) {
      clearTimeout(buttonToggleTimeoutRef.current);
      buttonToggleTimeoutRef.current = null;
    }
    if (gracefulScrollTimeoutRef.current) {
      clearTimeout(gracefulScrollTimeoutRef.current);
      gracefulScrollTimeoutRef.current = null;
    }
    
    setIsManualLoadingInProgress(true);
    setLoadedMessageCount(newCount);
    setShowLoadMoreButton(false);
    
    // Clear manual loading flag after a short delay
    setTimeout(() => {
      console.log('🧹 Clearing manual loading flag in parent');
      setIsManualLoadingInProgress(false);
    }, 500);
  }, [loadedMessageCount, LOAD_MORE_INCREMENT]);

  // Handle scroll-based message loading - MANUAL ONLY
  const handleScroll = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    // Prevent flickering by only processing significant scroll changes
    const scrollDifference = Math.abs(scrollTop - lastScrollPositionRef.current);
    if (scrollDifference < 10 && lastScrollPositionRef.current !== -1) {
      return; // Ignore small scroll changes that might cause flickering
    }
    lastScrollPositionRef.current = scrollTop;
    
    const isAtTop = scrollTop < 50; // Within 50px of top
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100; // Within 100px of bottom
    
    // Show load more button when user scrolls up and there are more messages to load
    const totalMessages = currentSession?.messages?.length || 0;
    const hasMoreMessages = loadedMessageCount < totalMessages;
    
    // Debounced button state changes to prevent flickering
    const debouncedButtonToggle = (shouldShow: boolean, reason: string) => {
      if (buttonToggleTimeoutRef.current) {
        clearTimeout(buttonToggleTimeoutRef.current);
      }
      
      buttonToggleTimeoutRef.current = setTimeout(() => {
        setShowLoadMoreButton(current => {
          if (shouldShow !== current) {
            console.log(`📜 ${reason}`);
            return shouldShow;
          }
          return current;
        });
      }, 50); // Small debounce delay
    };
    
    // Show button when user scrolls near top - NO AUTO-LOADING
    if (isAtTop && !isManualLoadingInProgress && !showLoadMoreButton) {
      const buttonState = hasMoreMessages ? 'more messages available' : 'no more messages';
      debouncedButtonToggle(true, `User scrolled to top - showing load button (${buttonState})`);
    }
    
    // Hide button when user scrolls away from top (unless loading)
    if (!isAtTop && showLoadMoreButton && !isManualLoadingInProgress) {
      debouncedButtonToggle(false, 'User scrolled away from top - hiding load button');
    }
    
    // Performance optimization: Auto-collapse to default count when user scrolls to bottom
    // This prevents DOM bloat with large message histories
    if (isAtBottom && loadedMessageCount > DEFAULT_MESSAGE_COUNT && !isManualLoadingInProgress) {
      // Throttle auto-collapse to prevent rapid cycles (minimum 3 seconds between collapses)
      const currentTime = Date.now();
      const timeSinceLastCollapse = currentTime - lastCollapseTimeRef.current;
      
      if (timeSinceLastCollapse > 3000) {
        console.log('🔽 Auto-collapse for performance:', loadedMessageCount, '→', DEFAULT_MESSAGE_COUNT);
        lastCollapseTimeRef.current = currentTime;
        
        // Capture that user was at bottom BEFORE we change DOM
        const userWasAtBottom = isAtBottom;
        
        setLoadedMessageCount(DEFAULT_MESSAGE_COUNT);
        setShowLoadMoreButton(false); // Hide button since we're back to default count
        
        // Gracefully scroll to bottom after DOM height changes to prevent jarring jumps
        if (userWasAtBottom) {
          // Clear any existing graceful scroll timeout
          if (gracefulScrollTimeoutRef.current) {
            clearTimeout(gracefulScrollTimeoutRef.current);
          }
          
          gracefulScrollTimeoutRef.current = setTimeout(() => {
            const container = document.querySelector('[data-testid="messages-container"]') as HTMLElement;
            if (container) {
              console.log('📍 Graceful scroll to bottom after auto-collapse (preventing jarring jump)');
              container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
              });
            }
            gracefulScrollTimeoutRef.current = null;
          }, 100); // Small delay to let DOM update after message count change
        }
      } else {
        console.log('🔽 Auto-collapse throttled - only', Math.round(timeSinceLastCollapse / 1000), 'seconds since last collapse');
      }
    }
    
  }, [currentSession?.messages?.length, loadedMessageCount, isManualLoadingInProgress, DEFAULT_MESSAGE_COUNT]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (buttonToggleTimeoutRef.current) {
        clearTimeout(buttonToggleTimeoutRef.current);
      }
      if (gracefulScrollTimeoutRef.current) {
        clearTimeout(gracefulScrollTimeoutRef.current);
      }
    };
  }, []);

  // Initialize load more button visibility on mount/session change - don't show initially
  useEffect(() => {
    if (!autoScrollEnabled && currentSession?.messages) {
      // Don't show button on initial load, only after user scrolls up
      const shouldShowButton = false;
      
      if (shouldShowButton !== showLoadMoreButton) {
        console.log('📜 Initializing Load Earlier Messages button visibility (hidden on first load):', shouldShowButton);
        setShowLoadMoreButton(shouldShowButton);
      }
    }
  }, [currentSession?.messages?.length, loadedMessageCount, isManualLoadingInProgress, autoScrollEnabled]);

  // Load chat history from localStorage on mount (replace initial session if stored data exists)
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
        
        // Replace the initial session with stored data
        setSessions(sessionsWithDates);
        // Ensure we have a valid currentSessionId
        const validSessionId = data.currentSessionId || (sessionsWithDates[0]?.contextId) || initialSession.contextId;
        setCurrentSessionId(validSessionId);
        setSuggestions(initialSuggestions);
        setLoadedMessageCount(DEFAULT_MESSAGE_COUNT);
        setShowLoadMoreButton(false);
      } else {
        // Keep the initial session that's already loaded, just reset states
        setSuggestions(initialSuggestions);
        setLoadedMessageCount(DEFAULT_MESSAGE_COUNT);
        setShowLoadMoreButton(false);
        setIsManualLoadingInProgress(false);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      alertApi.post({
        message: 'Failed to load chat history. Using current session.',
        severity: 'warning',
      });
      // Keep the existing initial session on error
      setSuggestions(initialSuggestions);
      setLoadedMessageCount(DEFAULT_MESSAGE_COUNT);
      setShowLoadMoreButton(false);
    }
  }, [botName, alertApi, initialSuggestions]);

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
      contextId: uuidv4(),
      title: `Chat ${sessions.length + 1}`,
      messages: [
        {
          messageId: uuidv4(),
          text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`.replace(/⟦|⟧/g, ''),
          isUser: false,
          timestamp: createTimestamp(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.contextId);
    setSuggestions(initialSuggestions);
    setLoadedMessageCount(DEFAULT_MESSAGE_COUNT); // Reset to default count on new session
    setShowLoadMoreButton(false);
    setIsManualLoadingInProgress(false);
  }, [sessions.length, botName, initialSuggestions]);

  // Switch to session
  const switchToSession = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      // Always keep suggestions visible
      setSuggestions(initialSuggestions);
      // Reset to default count on session switch
      setLoadedMessageCount(DEFAULT_MESSAGE_COUNT);
      setShowLoadMoreButton(false);
      setIsManualLoadingInProgress(false);
    },
    [initialSuggestions],
  );

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ DELETE SESSION REQUESTED:', {
          sessionId,
          totalSessions: sessions.length,
          sessionExists: sessions.some(s => s.contextId === sessionId)
        });
      }
      const remainingSessions = sessions.filter(s => s.contextId !== sessionId);
      setSessions(remainingSessions);
      
      if (currentSessionId === sessionId) {
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].contextId);
        } else {
          // If no sessions left, create a new one
          const newSession = createInitialSession();
          setSessions([newSession]);
          setCurrentSessionId(newSession.contextId);
        }
      }
    },
    [sessions, currentSessionId, createInitialSession],
  );

  // Remove this useEffect since we handle initial session creation in the load effect

  // Add message to current session
  const addMessageToSession = useCallback(
    (message: Message) => {
      if (!currentSessionId) return;

      setSessions(prev =>
        prev.map(session => {
          if (session.contextId === currentSessionId) {
            const updatedMessages = [
              ...session.messages,
              { ...message, messageId: message.messageId || uuidv4(), timestamp: message.timestamp || createTimestamp() },
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
      // 🔧 CRITICAL FIX: Reset isStreaming flag on ALL previous messages to prevent reuse
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 RESETTING isStreaming FLAG ON ALL PREVIOUS MESSAGES');
      }
      setSessions(prev =>
        prev.map(session => {
          if (session.contextId === currentSessionId) {
            const updatedMessages = session.messages.map(msg => ({
              ...msg,
              isStreaming: false // Reset ALL previous streaming flags
            }));
            if (process.env.NODE_ENV === 'development') {
              const streamingCount = session.messages.filter(m => m.isStreaming).length;
              console.log('🔄 RESET STREAMING FLAGS:', {
                sessionId: session.contextId,
                totalMessages: session.messages.length,
                previouslyStreaming: streamingCount,
                nowStreaming: 0
              });
            }
            return { ...session, messages: updatedMessages };
          }
          return session;
        }),
      );

      const newMessage: Message = {
        messageId: uuidv4(),
        text: initialText,
        isUser: false,
        timestamp: createTimestamp(),
        isStreaming: true,
        // 🔧 FIX: Don't add executionPlan property unless message actually needs it
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('➕ ADDED NEW STREAMING MESSAGE - no executionPlan property, timestamp:', newMessage.timestamp);
        console.log('🆔 NEW STREAMING MESSAGE ID:', newMessage.messageId);
        console.log('🧹 CLEARING STALE EXECUTION PLAN BUFFER ENTRIES');
      }
      
      // 🎯 UI HACK: Mark this message as "loading" execution plan
      if (newMessage.messageId) {
        setExecutionPlanLoading(prev => {
          const newSet = new Set(prev);
          newSet.add(newMessage.messageId!);
          console.log('⏳ MARKING EXECUTION PLAN AS LOADING:', newMessage.messageId);
          return newSet;
        });
      }
      
      // 🔧 ULTRA-NUCLEAR OPTION: Completely clear execution plan buffer, localStorage, AND auto-expand state
      // This prevents any cross-contamination between different user requests
      setExecutionPlanBuffer(prev => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🧹 ULTRA-NUCLEAR BUFFER RESET:', {
            before: Object.keys(prev),
            afterReset: 'EMPTY',
            reason: 'New streaming message started'
          });
        }
        return {}; // Complete reset
      });
      
      // Also clear auto-expand state to prevent old execution plans from auto-expanding
      setAutoExpandExecutionPlans(prev => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🧹 CLEARING AUTO-EXPAND STATE:', {
            before: Array.from(prev),
            afterReset: 'EMPTY',
            reason: 'New streaming message started'
          });
        }
        return new Set(); // Complete reset
      });

      // 🚨 CRITICAL FIX: Reset accumulated execution plan React state (prevents previous message contamination)
      setAccumulatedExecutionPlan(prevPlan => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🧹 RESETTING ACCUMULATED EXECUTION PLAN STATE (addStreamingMessage):', {
            before: prevPlan ? prevPlan.substring(0, 100) + '...' : 'EMPTY',
            afterReset: 'EMPTY',
            reason: 'New streaming message started'
          });
        }
        return '';
      });
      
      addMessageToSession(newMessage);
    },
    [addMessageToSession, sessions, currentSessionId],
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
          if (session.contextId === currentSessionId) {
            const updatedMessages = [...session.messages];
            // 🔧 FIX: Find the actually streaming message, not just the last message
            const allStreamingMessages = updatedMessages.filter(msg => msg.isStreaming === true);
            // Take the NEWEST streaming message (last in array) as a failsafe if multiple exist
            const streamingMessage = allStreamingMessages[allStreamingMessages.length - 1];
            
            if (process.env.NODE_ENV === 'development') {
              console.log('🎯 UPDATE STREAMING MESSAGE - SEARCH RESULTS:', {
                totalMessages: updatedMessages.length,
                streamingMessagesFound: allStreamingMessages.length,
                streamingMessageIds: allStreamingMessages.map(m => m.messageId),
                selectedMessageId: streamingMessage?.messageId || 'none',
                selectedMessageText: streamingMessage?.text?.substring(0, 50) + '...' || 'none',
                allMessageDetails: updatedMessages.map(m => ({
                  id: m.messageId,
                  timestamp: m.timestamp,
                  isStreaming: m.isStreaming,
                  isUser: m.isUser,
                  textPreview: m.text?.substring(0, 30) + '...'
                }))
              });
            }
            if (streamingMessage && !streamingMessage.isUser) {
              // 🚀 SIMPLIFIED: Just set execution plan directly on message, no buffer complexity
              streamingMessage.text = text.replace(/⟦|⟧/g, '');
              streamingMessage.isStreaming = isStreaming;
              
              // Execution plan is now stored only in executionPlanBuffer, not on message object
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
    // Mark the streaming message as not streaming to trigger execution plan auto-collapse
    if (currentSessionId) {
      setSessions(prev =>
        prev.map(session => {
          if (session.contextId === currentSessionId) {
            const updatedMessages = [...session.messages];
            // 🔧 FIX: Find the actually streaming message, not just the last message
            const allStreamingMessages = updatedMessages.filter(msg => msg.isStreaming === true);
            const streamingMessage = allStreamingMessages[allStreamingMessages.length - 1];
            if (streamingMessage && !streamingMessage.isUser) {
              streamingMessage.isStreaming = false;
              if (process.env.NODE_ENV === 'development') {
                console.log('🏁 FINISHED STREAMING MESSAGE:', {
                  messageId: streamingMessage.messageId,
                  totalStreamingFound: allStreamingMessages.length,
                  allStreamingIds: allStreamingMessages.map(m => m.messageId)
                });
              }
              
              // 🔧 CRITICAL FIX: Store accumulated execution plan in buffer at END of streaming
              setAccumulatedExecutionPlan(currentPlan => {
                if (currentPlan && currentPlan.trim().length > 0) {
                  console.log('📋 STORING EXECUTION PLAN AT END OF STREAMING:', {
                    messageId: streamingMessage.messageId,
                    planLength: currentPlan.length,
                    planPreview: currentPlan.substring(0, 100) + '...'
                  });
                  
                  const messageKey = streamingMessage.messageId || 'unknown';
                  // Remove markers if present (⟦ and ⟧), otherwise content is used as-is
                  const cleanExecutionPlan = currentPlan.replace(/⟦|⟧/g, '');
                  
                  // Store in buffer
                  setExecutionPlanBuffer(prev => {
                    const newBuffer = {
                      ...prev,
                      [messageKey]: cleanExecutionPlan
                    };
                    console.log('✅ EXECUTION PLAN STORED IN BUFFER:', {
                      messageKey,
                      bufferSize: Object.keys(newBuffer).length,
                      bufferKeys: Object.keys(newBuffer)
                    });
                    return newBuffer;
                  });
                  
                  // Mark for auto-expansion
                  setAutoExpandExecutionPlans(prev => {
                    const newSet = new Set(prev);
                    newSet.add(messageKey);
                    return newSet;
                  });
                }
                return currentPlan; // Don't clear it yet, let the next request clear it
              });
            }
            return { ...session, messages: updatedMessages };
          }
          return session;
        }),
      );
    }
    setIsTyping(false);
    
    // 🚀 FOCUS BACK TO INPUT - Better UX after response completes
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        console.log('🎯 FOCUSED INPUT AFTER RESPONSE COMPLETION');
      }
    }, 100); // Small delay to ensure DOM updates are complete
  }, [currentSessionId]);

  // Main message submission handler
  const handleMessageSubmit = useCallback(
    async (messageText?: string) => {
      const inputText = messageText || userInput.trim();
      if (!inputText) return;

      // 🔧 EARLY ULTRA-NUCLEAR CLEANUP: Clear execution plan state + localStorage before processing new user request
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 EARLY ULTRA-NUCLEAR CLEANUP - User submitted new message');
      }
      setExecutionPlanBuffer(prev => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🧹 EARLY BUFFER RESET:', {
            before: Object.keys(prev),
            afterReset: 'EMPTY',
            reason: 'User submitted new message'
          });
        }
        return {};
      });
      setAutoExpandExecutionPlans(prev => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🧹 EARLY AUTO-EXPAND RESET:', {
            before: Array.from(prev),
            afterReset: 'EMPTY',
            reason: 'User submitted new message'
          });
        }
        return new Set();
      });

      // 🚨 CRITICAL FIX: Reset accumulated execution plan React state
      setAccumulatedExecutionPlan(prevPlan => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🧹 RESETTING ACCUMULATED EXECUTION PLAN STATE:', {
            before: prevPlan ? prevPlan.substring(0, 100) + '...' : 'EMPTY',
            afterReset: 'EMPTY',
            reason: 'User submitted new message'
          });
        }
        return '';
      });

      // Auto-create session if none exist
      let sessionToUse = currentSessionId;
      if (sessions.length === 0 || !currentSessionId) {
        const newSessionId = uuidv4();
        const newSession: ChatSession = {
          contextId: newSessionId,
          title:
            inputText.length > 50
              ? `${inputText.substring(0, 50)}...`
              : inputText,
          messages: [
            {
              text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`.replace(/⟦|⟧/g, ''),
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
        messageId: uuidv4(),
        text: inputText,
        isUser: true,
        timestamp: createTimestamp(),
      };

      // Add message to the correct session (either current or newly created)
      setSessions(prev =>
        prev.map(session => {
          if (session.contextId === sessionToUse) {
            const updatedMessages = [
              ...session.messages,
              { ...userMessage, messageId: userMessage.messageId || uuidv4(), timestamp: userMessage.timestamp || createTimestamp() },
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
        console.log('🚫 No chatbotApi available when trying to send message');
        setSessions(prev =>
          prev.map(session => {
            if (session.contextId === sessionToUse) {
              return {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    messageId: uuidv4(),
                    text: `🚫 **${botName} Multi-Agent System Disconnected**\n\nI'm unable to connect to the ${botName} Multi-Agent System at this time. Please check your configuration and try again.`.replace(/⟦|⟧/g, ''),
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
          sessions.find(s => s.contextId === sessionToUse) ||
          (sessionToUse === currentSessionId ? currentSession : null);

        // Use real-time SSE streaming if enabled
        if (enableStreaming) {
          // Track all artifact names we see during streaming (outside try block for error logging)
          const seenArtifactNames = new Set<string>();
          
          try {
            console.log('ATTEMPTING STREAMING...');
            // Add streaming message placeholder
            addStreamingMessage();

            let lastContextId: string | undefined;
            let accumulatedText = '';

            // 🚨 ABORT PREVIOUS STREAMING REQUEST to prevent contamination
            if (abortControllerRef.current) {
              console.log('🛑 ABORTING PREVIOUS STREAMING REQUEST');
              abortControllerRef.current.abort();
            }
            
            // Generate unique request ID for this streaming session
            const currentRequestId = uuidv4();
            currentRequestIdRef.current = currentRequestId;
            console.log('🆔 NEW REQUEST ID:', currentRequestId);
            
            // Create new AbortController for this request
            abortControllerRef.current = new AbortController();

            // Clear execution plan state at the start of each new response
            setIsCapturingExecutionPlan(false);
            setAccumulatedExecutionPlan('');
            console.log('🧹 CLEARED EXECUTION PLAN STATE FOR NEW MESSAGE - starting fresh');

            // Stream responses in real-time using SSE
            let streamIterator;
            try {
              streamIterator = chatbotApi.submitA2ATaskStream(
                !workingSession?.contextId,
                inputText,
                workingSession?.contextId,
              );
            } catch (apiError) {
              console.error('🚫 A2A Client error during stream initialization:', apiError);
              throw apiError; // Re-throw to be caught by outer streaming catch block
            }
            
            for await (const event of streamIterator) {
            // 🚨 CHECK FOR ABORT SIGNAL: Cancel processing if new request started
            if (abortControllerRef.current?.signal.aborted || currentRequestIdRef.current !== currentRequestId) {
              console.log('🛑 STREAMING ABORTED - New request started or cancelled');
              break;
            }
            
            // Update contextId from any event that has it
            if (event.kind === 'task' && event.contextId) {
              lastContextId = event.contextId;
            } else if (event.contextId) {
              lastContextId = event.contextId;
            }

            // 🔍 COMPREHENSIVE EVENT LOGGING - Log ALL events and artifact names
            console.log('📨 STREAM EVENT:', {
              kind: event.kind,
              hasArtifact: !!event.artifact,
              artifactName: event.artifact?.name || 'N/A',
              role: event.role || 'N/A',
              hasContextId: !!event.contextId,
              timestamp: new Date().toISOString()
            });
            
            // Track artifact names
            if (event.artifact?.name) {
              seenArtifactNames.add(event.artifact.name);
            }

            // Handle different event types
            if (event.kind === 'message' && event.role === 'agent') {
              // Accumulate text from agent messages
              const textPart = event.parts?.find((p: any) => p.kind === 'text');
              if (textPart && 'text' in textPart) {
                console.log('💬 AGENT MESSAGE - text:', textPart.text.substring(0, 200) + (textPart.text.length > 200 ? '...' : ''));
                
                // 🚨 DEBUGGING: Check if agent message contains execution plan content
                if (textPart.text.includes('⟦') || textPart.text.includes('⟧')) {
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
                // 🔍 COMPREHENSIVE ARTIFACT LOGGING - Log ALL artifact names
                console.log('🎯 ARTIFACT EVENT DETECTED:', {
                  name: event.artifact?.name,
                  kind: event.kind,
                  append: event.append,
                  hasTextPart: event.artifact.parts.some((p: any) => p.kind === 'text'),
                  totalParts: event.artifact.parts.length,
                  timestamp: new Date().toISOString()
                });
                
                const textPart = event.artifact.parts.find(
                  (p: any) => p.kind === 'text',
                );
                if (textPart && 'text' in textPart) {
                  const { isToolNotification, operation, isStart } = detectToolNotification(event.artifact);
                  
                  console.log('ARTIFACT UPDATE - name:', event.artifact?.name, 'append:', event.append, 'text:', textPart.text.substring(0, 200) + (textPart.text.length > 200 ? '...' : ''), 'isToolNotification:', isToolNotification);
                  
                  // 🚨 DEBUGGING: Check if this content contains execution plan markers
                  if (textPart.text.includes('⟦') || textPart.text.includes('⟧')) {
                    console.log('🎯 EXECUTION PLAN MARKERS DETECTED IN STREAMING CONTENT!');
                    console.log('🎯 FULL TEXT:', textPart.text);
                  } else if (textPart.text.toLowerCase().includes('task:') || textPart.text.toLowerCase().includes('approach:')) {
                    console.log('🔍 POTENTIAL EXECUTION PLAN CONTENT WITHOUT MARKERS:');
                    console.log('🔍 TEXT:', textPart.text.substring(0, 300) + '...');
                    console.log('🔍 This should have ⟦⟧ markers around it!');
                  }
                  
                  // 🔧 SIMPLE LOGIC: Just capture execution_plan_streaming content for accumulation
                  if (event.artifact?.name === 'execution_plan_streaming') {
                    // This artifact accumulates chunks for fallback
                    if (currentRequestIdRef.current === currentRequestId) {
                      console.log('✅ ACCEPTING EXECUTION PLAN STREAMING CHUNK');
                      setAccumulatedExecutionPlan(prev => prev + textPart.text);
                    }
                    console.log('Execution plan streaming chunk processed, continuing...');
                  } else if (event.artifact?.name === 'execution_plan_update') {
                    // 🚀 REAL-TIME UPDATE: Use execution_plan_update for immediate display
                    // This contains the complete plan so far, no need to accumulate chunks
                    if (currentRequestIdRef.current === currentRequestId) {
                      console.log('📋 EXECUTION PLAN UPDATE - Updating display in real-time');
                      
                      const completePlan = textPart.text;
                      const cleanExecutionPlan = completePlan.replace(/⟦|⟧/g, '');
                      
                      // Find streaming message and update immediately
                      setSessions(prevSessions => {
                        return prevSessions.map(session => {
                          if (session.contextId === currentSessionId) {
                            const updatedMessages = session.messages.map(msg => {
                              if (msg.isStreaming === true) {
                                const messageKey = msg.messageId || 'unknown';
                                
                                // 🎯 UI HACK: Clear loading state now that real data arrived
                                setExecutionPlanLoading(prevLoading => {
                                  const newSet = new Set(prevLoading);
                                  newSet.delete(messageKey);
                                  console.log('✅ EXECUTION PLAN LOADED - Removing loading state:', messageKey);
                                  return newSet;
                                });
                                
                                // Update buffer for real-time display
                                setExecutionPlanBuffer(prevBuffer => ({
                                  ...prevBuffer,
                                  [messageKey]: cleanExecutionPlan
                                }));
                                
                                // Auto-expand on first update
                                setAutoExpandExecutionPlans(prevSet => {
                                  const newSet = new Set(prevSet);
                                  if (!newSet.has(messageKey)) {
                                    newSet.add(messageKey);
                                    console.log('🔄 AUTO-EXPANDING EXECUTION PLAN');
                                  }
                                  return newSet;
                                });
                              }
                              return msg;
                            });
                            return { ...session, messages: updatedMessages };
                          }
                          return session;
                        });
                      });
                      
                      // Also store in accumulated state for finishStreamingMessage
                      setAccumulatedExecutionPlan(completePlan);
                    }
                    console.log('Execution plan update processed, continuing...');
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
                      
                      // 🔧 SIMPLE LOGIC: Route streaming_result based on capture state (existing logic handles markers)
                      if (isCapturingExecutionPlan) {
                        // 🚨 REQUEST ISOLATION: Only accept content for current request
                        if (currentRequestIdRef.current === currentRequestId) {
                          console.log('✅ CAPTURING FOR EXECUTION PLAN - Request ID matches:', cleanText.substring(0, 100) + '...');
                          // We're capturing execution plan - add this content to execution plan
                          setAccumulatedExecutionPlan(prev => {
                            const newContent = prev + cleanText;
                            console.log('📋 EXECUTION PLAN UPDATED from:', prev.substring(0, 50) + '...', 'to:', newContent.substring(0, 50) + '...');
                            return newContent;
                          });
                        } else {
                          console.log('🚫 REJECTING EXECUTION PLAN CAPTURE - Request ID mismatch:', {
                            current: currentRequestIdRef.current,
                            streaming: currentRequestId,
                            content: cleanText.substring(0, 50) + '...'
                          });
                        }
                        
                        // Don't add to main content - this is execution plan content
                        cleanText = '';
                      } else {
                        // Normal mode - add to main content
                        console.log('📄 ADDING TO MAIN CONTENT:', cleanText.substring(0, 100) + '...');
                      }

                      // Note: accumulatedExecutionPlan will be used directly in the simplified logic below
                      
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

                      // 🚀 SIMPLIFIED: Just pass execution plan directly to message
                      if (process.env.NODE_ENV === 'development') {
                        console.log('📄 STREAMING UPDATE:', {
                          textLength: accumulatedText.length,
                          hasExecutionPlan: !!accumulatedExecutionPlan,
                          executionPlanLength: accumulatedExecutionPlan?.length || 0
                        });
                      }

                      // Clean the text content from execution plan markers
                      const cleanedTextForMessage = accumulatedText.replace(/⟦[^⟧]*⟧/g, '').trim();
                      const cleanedExecutionPlan = accumulatedExecutionPlan ? accumulatedExecutionPlan.replace(/⟦|⟧/g, '') : '';
                      
                      updateStreamingMessage(cleanedTextForMessage, cleanedExecutionPlan, true);
                      
                      // 🚀 CLEAN BUFFER AFTER EACH UPDATE - prevents contamination
                      if (cleanedExecutionPlan) {
                        console.log('🧹 CLEANING EXECUTION PLAN STATE AFTER UPDATE');
                        setAccumulatedExecutionPlan('');
                      }
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
                  event.artifacts.find((a: any) => a.name === 'final_result') ||
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
                session.contextId === sessionToUse
                  ? { ...session, contextId: lastContextId }
                  : session,
              ),
            );
          }

            // 📊 ARTIFACT SUMMARY: Log all artifact names we encountered during streaming
            console.log('📊 STREAMING SESSION COMPLETE - ARTIFACT SUMMARY:', {
              totalUniqueArtifacts: seenArtifactNames.size,
              artifactNames: Array.from(seenArtifactNames).sort(),
              hasExecutionPlanStreaming: seenArtifactNames.has('execution_plan_streaming'),
              hasExecutionPlanUpdate: seenArtifactNames.has('execution_plan_update'),
              hasStreamingResult: seenArtifactNames.has('streaming_result'),
              hasToolNotifications: Array.from(seenArtifactNames).some((name: string) => name.includes('tool_notification')),
              timestamp: new Date().toISOString()
            });

            // Finish streaming and cleanup operational state
            finishStreamingMessage();
            setIsTyping(false);
            setIsInOperationalMode(false);
            setCurrentOperation(null);
            return;
          } catch (streamingError) {
            console.error('STREAMING FAILED, FALLING BACK TO NON-STREAMING:', streamingError);
            
            // 📊 ARTIFACT SUMMARY (ERROR CASE): Log artifacts seen before failure
            console.log('📊 STREAMING FAILED - ARTIFACT SUMMARY BEFORE ERROR:', {
              totalUniqueArtifacts: seenArtifactNames.size,
              artifactNames: Array.from(seenArtifactNames).sort(),
              hasExecutionPlanStreaming: seenArtifactNames.has('execution_plan_streaming'),
              hasExecutionPlanUpdate: seenArtifactNames.has('execution_plan_update'),
              hasStreamingResult: seenArtifactNames.has('streaming_result'),
              hasToolNotifications: Array.from(seenArtifactNames).some((name: string) => name.includes('tool_notification')),
              timestamp: new Date().toISOString()
            });
            
            // Check if it's an A2A connection error that shouldn't fallback
            const err = streamingError as Error;
            const isA2AConnectionError = err.message.includes('Unable to connect to agent') || 
                                       err.message.includes('.well-known/agent.json') ||
                                       err.message.includes('_fetchAndCacheAgentCard');
            
            // For A2A connection errors, don't attempt non-streaming fallback
            if (isA2AConnectionError) {
              console.log('🚫 A2A connection error detected - skipping non-streaming fallback');
              throw streamingError; // Re-throw to be handled by main catch block
            }
            
            // Clean up any streaming UI state including operational mode
            setIsInOperationalMode(false);
            setCurrentOperation(null);
            setIsTyping(true); // Reset typing state for non-streaming fallback
          }
        }

        // Non-streaming mode: submit task and wait for response
        let taskResult;
        try {
          taskResult = await chatbotApi.submitA2ATask(
            !workingSession?.contextId,
            inputText,
            workingSession?.contextId,
          );
        } catch (apiError) {
          console.error('🚫 A2A Client error during non-streaming task submission:', apiError);
          throw apiError; // Re-throw to be caught by main catch block
        }

        // Update session with contextId for continuity
        if (taskResult.contextId && sessionToUse) {
          setSessions(prev =>
            prev.map(session =>
              session.contextId === sessionToUse
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
            taskResult.artifacts.find((a: any) => a.name === 'final_result') ||
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
                // Check if it's a tool notification by looking for specific patterns with agent names
                const trimmedText = text.trim();
                const isToolMessage = (
                  // Tool start: "🔧 Argocd: Calling tool:" or "🔧 Supervisor: Calling Agent"
                  (trimmedText.includes('🔧') && (trimmedText.includes('Calling tool:') || trimmedText.includes('Calling Agent'))) ||
                  // Tool completion: "✅ Argocd: Tool ... completed" or "✅ Supervisor: Agent ... completed"
                  (trimmedText.includes('✅') && (trimmedText.includes('Tool') || trimmedText.includes('Agent')) && trimmedText.includes('completed'))
                );
                
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
            messageId: uuidv4(),
            text: (resultText || '').replace(/⟦|⟧/g, ''),
            isUser: false,
            timestamp: createTimestamp(),
            executionPlan: (executionPlanText || '').replace(/⟦|⟧/g, ''), // Use empty string instead of undefined
            isStreaming: false, // Mark as completed for auto-collapse
          };
          console.log('📝 NON-STREAMING MESSAGE CREATED:', {
            textLength: newMessage.text.length,
            executionPlanLength: newMessage.executionPlan?.length || 0,
            timestamp: newMessage.timestamp
          });

          setSessions(prev =>
            prev.map(session => {
              if (session.contextId === sessionToUse) {
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
        console.log('🚫 Message submission error:', err.message);
        
        // When message submission fails, also set connection status to disconnected and start countdown
        console.log('🔴 Message failed, setting connection status to disconnected with countdown');
        setConnectionStatus('disconnected');
        setNextRetryCountdown(30);
        
        // Handle A2A Client specific errors more gracefully
        const isA2AConnectionError = err.message.includes('Unable to connect to agent') || 
                                   err.message.includes('.well-known/agent.json') ||
                                   err.message.includes('_fetchAndCacheAgentCard');
        
        // Don't set apiError - connection banner will handle display

        // Check if it's a timeout error and display it directly without additional prefix
        const isTimeoutError = err.message.includes('timed out');
        const errorMessage = isTimeoutError
          ? `⏱️ ${err.message}`
          : isA2AConnectionError
            ? `🚫 **${botName} Multi-Agent System Disconnected**\n\nConnection failed: Unable to reach the agent service. Retrying automatically...`
            : `🚫 **${botName} Multi-Agent System Disconnected**\n\nError: ${err.message}`;

        setSessions(prev =>
          prev.map(session => {
            if (session.contextId === sessionToUse) {
              return {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    messageId: uuidv4(),
                    text: errorMessage.replace(/⟦|⟧/g, ''),
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
    console.log('🔄 Reset chat triggered');
    if (currentSessionId) {
      setSessions(prev =>
        prev.map(session =>
          session.contextId === currentSessionId
            ? {
                ...session,
                messages: [
                  {
                    messageId: uuidv4(),
                    text: `Hi! I am ${botName}, your AI Platform Engineer. How can I help you today?`.replace(/⟦|⟧/g, ''),
                    isUser: false,
                    timestamp: createTimestamp(),
                  },
                ],
                contextId: uuidv4(), // Reset context with new ID
                updatedAt: new Date(),
              }
            : session,
        ),
      );
    }
    setUserInput('');
    setSuggestions(initialSuggestions);
    setLoadedMessageCount(DEFAULT_MESSAGE_COUNT); // Reset to default count on chat reset
    setShowLoadMoreButton(false);
    setIsManualLoadingInProgress(false);
    // Only clear API error if we're currently connected
    // Don't clear connection errors when resetting chat
    if (connectionStatus === 'connected') {
      setApiError(null);
    }
  };

  const toggleFullscreen = () => {
    // Don't allow fullscreen toggle while a request is in progress
    if (isTyping) {
      console.log('⚠️ Fullscreen toggle blocked - request in progress');
      return;
    }
    setIsFullscreen(!isFullscreen);
  };

  const renderContent = () => (
    <Grid container spacing={1} className={classes.mainContent} wrap="nowrap">
      {/* Chat History Sidebar - Dynamic width based on collapse state */}
      <Grid
        item
        className={isSidebarCollapsed ? classes.sidebarColumnCollapsed : classes.sidebarColumn}
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

      {/* Main Chat Area - Dynamic width based on sidebar state */}
      <Grid item className={isSidebarCollapsed ? classes.chatColumnExpanded : classes.chatColumn}>
        {(apiError || connectionStatus === 'checking' || connectionStatus === 'disconnected') && (
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
                {apiError ? 'Connection Error' : 'Connection Status'}
              </Typography>
              {(apiError || connectionStatus === 'disconnected') && (
                <IconButton
                  size="small"
                  onClick={() => {
                    if (apiError) {
                      setApiError(null);
                    } else {
                      setConnectionStatus('connected'); // Temporarily hide banner until next check
                    }
                  }}
                  style={{ color: 'inherit', padding: 2 }}
                  title="Dismiss"
                >
                  ×
                </IconButton>
              )}
            </div>
            <Typography
              variant="body2"
              style={{
                marginBottom: 6,
                fontSize: '0.8125rem',
                lineHeight: 1.3,
              }}
            >
              {apiError || (connectionStatus === 'checking' ? 'Connecting to agent...' : 'Agent connection failed')}
              {(nextRetryCountdown > 0 || connectionStatus === 'checking') && (
                nextRetryCountdown > 0 
                  ? ` - Retrying in ${nextRetryCountdown}s...`
                  : ` - Connecting...`
              )}
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

            {currentSession ? (
              (() => {
                // Debug logging for props passed to ChatContainer
                console.log('🎯 CHATCONTAINER PROPS DEBUG:', {
                  messagesCount: renderedMessages.length,
                  messageTimestamps: renderedMessages.map(m => m.timestamp),
                  executionPlanBufferKeys: Object.keys(executionPlanBuffer),
                  executionPlanBufferSize: Object.keys(executionPlanBuffer).length,
                  sessionId: currentSessionId
                });
                
                return (
                  <ChatContainer
                    key={`chat-${currentSessionId}-${renderedMessages.length}`}
                    messages={renderedMessages}
                    userInput={userInput}
                    setUserInput={setUserInput}
                    onMessageSubmit={handleMessageSubmit}
                    onSuggestionClick={handleSuggestionClick}
                    onReset={resetChat}
                    isTyping={isTyping}
                    suggestions={suggestions}
                    onScroll={handleScroll}
                    onLoadMore={handleLoadMore}
                    hasMoreMessages={loadedMessageCount < (currentSession?.messages?.length || 0)}
                    showLoadMoreButton={showLoadMoreButton}
                    loadMoreIncrement={LOAD_MORE_INCREMENT}
                    executionPlanBuffer={executionPlanBuffer}
                    autoExpandExecutionPlans={autoExpandExecutionPlans}
                    executionPlanLoading={executionPlanLoading}
                autoScrollEnabled={autoScrollEnabled}
                setAutoScrollEnabled={setAutoScrollEnabled}
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
                );
              })()
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="textSecondary">Loading chat session...</Typography>
              </Box>
            )}
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
                {connectionStatus === 'disconnected' && (
                  nextRetryCountdown > 0 
                    ? `Disconnected (retry in ${nextRetryCountdown}s)` 
                    : 'Disconnected'
                )}
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
            <Tooltip title={isTyping ? "Please wait for response to complete" : "Exit Fullscreen"}>
              <span>
                <IconButton
                  onClick={toggleFullscreen}
                  className={classes.fullscreenButton}
                  disabled={isTyping}
                  style={{ 
                    opacity: isTyping ? 0.5 : 1,
                    cursor: isTyping ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FullscreenExitIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
        <div className={classes.fullscreenContent}>
          <Page themeId="tool" key={`fullscreen-${currentSessionId}`}>
            <Content noPadding>
              {renderContent()}
            </Content>
          </Page>
        </div>
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
                {connectionStatus === 'disconnected' && (
                  nextRetryCountdown > 0 
                    ? `Disconnected (retry in ${nextRetryCountdown}s)` 
                    : 'Disconnected'
                )}
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
          <Tooltip title={isTyping ? "Please wait for response to complete" : "Fullscreen"}>
            <span>
              <IconButton
                onClick={toggleFullscreen}
                className={classes.fullscreenButton}
                disabled={isTyping}
                style={{ 
                  opacity: isTyping ? 0.5 : 1,
                  cursor: isTyping ? 'not-allowed' : 'pointer'
                }}
              >
                <FullscreenIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      <Box className={classes.pageContainer}>
        <Page themeId="tool" key={`normal-${currentSessionId}`}>
          <Content noPadding>
            <Box className={classes.contentWrapper}>{renderContent()}</Box>
          </Content>
        </Page>
      </Box>
    </>
  );
}

export default AgentForgePage;

