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

import { A2AClient, A2AStreamEventData } from '../a2a/client'; // Import necessary types
import { v4 as uuidv4 } from 'uuid'; // Example for generating task IDs
import {
  MessageSendParams,
  SendMessageResponse,
  Task,
  AgentCard,
} from '../a2a/schema';
import { IdentityApi, OpenIdConnectApi } from '@backstage/core-plugin-api';
import { Message, Feedback, UserEmailMode } from '../types';
import { createTimestamp } from '../utils';
import axios, { AxiosError } from 'axios';

export interface IChatbotApiOptions {
  requestTimeout?: number;
  useOpenIDToken?: boolean;
  userEmailMode?: UserEmailMode;
  autoReloadOnTokenExpiry?: boolean;
  feedbackEndpoint?: string | null;
  customCallPrefix?: string;
}

export class ChatbotApi {
  private client: A2AClient | null = null;
  private contextId: string;
  private identityApi: IdentityApi;
  private openIdConnectApi: OpenIdConnectApi | null;
  private useOpenIDToken: boolean;
  private userEmailMode: UserEmailMode;
  private autoReloadOnTokenExpiry: boolean;
  private feedbackEndpoint: string | null;
  private customCallPrefix: string;

  constructor(
    private apiBaseUrl: string,
    options: {
      identityApi: IdentityApi;
      openIdConnectApi?: OpenIdConnectApi | null;
    },
    apiOptions?: IChatbotApiOptions,
  ) {
    this.contextId = '';
    if (!this.apiBaseUrl) {
      throw new Error('Agent URL is not provided');
    }
    this.identityApi = options.identityApi;
    this.openIdConnectApi = options.openIdConnectApi ?? null;
    this.useOpenIDToken = apiOptions?.useOpenIDToken ?? false; // default to false which means use IdentityApi.getCredentials() (backstage token)
    this.autoReloadOnTokenExpiry = apiOptions?.autoReloadOnTokenExpiry ?? true; // default to true for better UX
    this.feedbackEndpoint = apiOptions?.feedbackEndpoint ?? null;
    this.userEmailMode = apiOptions?.userEmailMode ?? 'none'; // default to 'metadata' for backward compatibility
    this.customCallPrefix = apiOptions?.customCallPrefix ?? ''; // default to empty string
    try {
      const timeout = apiOptions?.requestTimeout ?? 300; // Default to 300 seconds
      this.client = new A2AClient(this.apiBaseUrl, timeout);
    } catch (error) {
      throw new Error('Error connecting to agent');
    }
  }

  /**
   * Decode JWT token and extract the expiration time (exp claim)
   * @param token - JWT token string
   * @returns Expiration time in seconds since epoch, or null if unable to decode
   */
  private decodeTokenExpiration(token: string): number | null {
    try {
      // JWT structure: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT token format');
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Replace URL-safe base64 characters and add padding if needed
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

      // Decode base64 to JSON
      const decodedPayload = JSON.parse(atob(paddedBase64));

      // Extract expiration time (exp claim is in seconds since epoch)
      if (decodedPayload.exp && typeof decodedPayload.exp === 'number') {
        return decodedPayload.exp;
      }

      console.warn('JWT token does not contain exp claim');
      return null;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  /**
   * Check if a token is expired
   * @param token - JWT token string
   * @returns true if token is expired, false if still valid
   */
  private isTokenExpired(token: string): boolean {
    const expirationTime = this.decodeTokenExpiration(token);

    if (!expirationTime) {
      // If we can't decode expiration, assume it's invalid
      console.warn('Unable to determine token expiration, treating as expired');
      return true;
    }

    // Get current time in seconds since epoch
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    const isExpired = expirationTime <= currentTime;

    if (isExpired) {
      const expiredAgo = currentTime - expirationTime;
      console.error(
        `❌ Token expired ${expiredAgo} seconds ago. Please refresh the page to re-authenticate.`,
      );
    }

    return isExpired;
  }

  /**
   * Show a toast notification on the page with countdown
   * @param baseMessage - Base message to display
   * @param durationSeconds - Duration in seconds
   */
  private showToastWithCountdown(
    baseMessage: string,
    durationSeconds: number = 5,
  ): void {
    // Create toast element
    const toast = document.createElement('div');

    // Style the toast
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#323232',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '10000',
      fontSize: '14px',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '90%',
      textAlign: 'center',
      animation: 'slideDown 0.3s ease-out',
    });

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Add toast to page
    document.body.appendChild(toast);

    // Update countdown
    let secondsLeft = durationSeconds;
    const updateMessage = () => {
      toast.textContent = `${baseMessage} ${secondsLeft} second${
        secondsLeft !== 1 ? 's' : ''
      }...`;
    };

    updateMessage();

    const countdownInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        updateMessage();
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Remove toast after duration
    setTimeout(() => {
      clearInterval(countdownInterval);
      toast.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 300);
    }, durationSeconds * 1000);
  }

  /**
   * Show a toast notification with a reload button for session expiry
   * @param message - Message to display
   */
  private showSessionExpiredToast(message: string): void {
    // Check if toast already exists
    const existingToast = document.getElementById('session-expired-toast');
    if (existingToast) {
      return; // Don't show duplicate toasts
    }

    // Create toast container
    const toast = document.createElement('div');
    toast.id = 'session-expired-toast';

    // Style the toast
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#d32f2f',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '10000',
      fontSize: '14px',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '500px',
      textAlign: 'center',
      animation: 'slideDown 0.3s ease-out',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'center',
    });

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    toast.appendChild(messageElement);

    // Create reload button
    const reloadButton = document.createElement('button');
    reloadButton.textContent = '🔄 Reload Page';
    Object.assign(reloadButton.style, {
      backgroundColor: '#fff',
      color: '#d32f2f',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background-color 0.2s',
    });

    // Add hover effect
    reloadButton.onmouseover = () => {
      reloadButton.style.backgroundColor = '#f5f5f5';
    };
    reloadButton.onmouseout = () => {
      reloadButton.style.backgroundColor = '#fff';
    };

    // Add click handler
    reloadButton.onclick = () => {
      window.location.reload();
    };

    toast.appendChild(reloadButton);

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Add toast to page
    document.body.appendChild(toast);
  }

  /**
   * Check if an error is a 401 authentication error
   * @param error - Error object
   * @returns true if it's a 401 error
   */
  private isAuthError(error: any): boolean {
    // Check for HTTP 401 Unauthorized status code
    if (error?.response?.status === 401) {
      return true;
    }
    if (error?.status === 401) {
      return true;
    }
    if (error?.message?.includes('401')) {
      return true;
    }
    if (error?.message?.toLocaleLowerCase('en-US').includes('unauthorized')) {
      return true;
    }
    return false;
  }

  private async getToken(): Promise<string | undefined> {
    if (this.useOpenIDToken) {
      if (!this.openIdConnectApi) {
        console.warn(
          'useOpenIDToken is true but openIdConnectApi is not provided, falling back to IdentityApi',
        );
        const credentials = await this.identityApi.getCredentials();
        return credentials.token;
      }

      // Get OpenID token
      const token = await this.openIdConnectApi.getIdToken();

      // Check if the OpenID token is expired
      if (token && this.isTokenExpired(token)) {
        if (this.autoReloadOnTokenExpiry) {
          console.log(
            '🔄 Token expired, showing toast and reloading page in 5 seconds...',
          );

          // Show toast notification with countdown
          this.showToastWithCountdown(
            '🔄 Authentication token expired. Reloading page in',
            5,
          );

          // Wait 5 seconds before reloading
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Reload the page to trigger re-authentication
          window.location.reload();

          // Throw error as fallback in case reload doesn't happen immediately
          throw new Error(
            'Authentication token has expired. Reloading page...',
          );
        } else {
          // Don't auto-reload, just throw error for UI to handle
          throw new Error(
            'Authentication token has expired. Please refresh the page to re-authenticate.',
          );
        }
      }

      return token;
    }

    // Use Backstage token (not OpenID) - no expiration check needed
    const credentials = await this.identityApi.getCredentials();
    return credentials.token;
  }

  /**
   * Get user email from Backstage IdentityApi
   * @returns User email or undefined if not available
   */
  private async getUserEmail(): Promise<string | undefined> {
    try {
      const profile = await this.identityApi.getProfileInfo();
      return profile.email;
    } catch (error) {
      console.warn('Error getting user email from IdentityApi:', error);
      return undefined;
    }
  }

  /**
   * Prepare message text and metadata based on user email mode
   * @param msg - Original message text
   * @returns Object containing messageText and metadata
   */
  private async prepareMessageWithEmail(
    msg: string,
  ): Promise<{ messageText: string; metadata?: Record<string, any> }> {
    let messageText = msg;
    let metadata: Record<string, any> | undefined;

    if (this.userEmailMode !== 'none') {
      const userEmail = await this.getUserEmail();
      if (userEmail) {
        if (this.userEmailMode === 'message') {
          // Prepend email to message text
          messageText = `The user email is ${userEmail}\n\n${msg}`;
        } else if (this.userEmailMode === 'metadata') {
          // Add email to metadata (A2A protocol best practice)
          metadata = { user_email: userEmail };
        }
      }
    }

    return { messageText, metadata };
  }

  /**
   * Prepare message text with custom call prefix
   * @param msg - Original message text
   * @returns Message text with custom call prefix prepended
   */
  private prepareMessageWithCustomCall(msg: string): string {
    if (this.customCallPrefix) {
      // Prepend custom call prefix to message text
      return `${this.customCallPrefix} ${msg}`;
    }
    return msg;
  }

  /**
   * Set custom call prefix for subsequent messages
   * @param prefix - Custom call prefix to prepend to messages
   */
  public setCustomCallPrefix(prefix: string): void {
    this.customCallPrefix = prefix;
  }

  /**
   * Clear custom call prefix
   */
  public clearCustomCallPrefix(): void {
    this.customCallPrefix = '';
  }

  /**
   * Get current custom call prefix
   * @returns Current custom call prefix
   */
  public getCustomCallPrefix(): string {
    return this.customCallPrefix;
  }

  public async submitA2ATask(
    newContext: boolean,
    msg: string,
    sessionContextId?: string,
  ) {
    try {
      const msgId = uuidv4();
      const token = await this.getToken();

      // Prepare message with custom call prefix first
      const processedMsg = this.prepareMessageWithCustomCall(msg);

      // Then prepare message with user email based on configured mode
      const { messageText, metadata } = await this.prepareMessageWithEmail(
        processedMsg,
      );

      const sendParams: MessageSendParams = {
        message: {
          messageId: msgId,
          role: 'user',
          parts: [{ text: messageText, kind: 'text' }],
          kind: 'message',
          metadata,
        },
      };

      // Use session contextId if provided, otherwise use internal contextId
      const contextToUse = sessionContextId || this.contextId;

      console.log('🔍 CONTEXT DEBUG:', {
        sessionContextId,
        internalContextId: this.contextId,
        contextToUse,
        newContext,
      });

      if (!newContext && contextToUse !== undefined) {
        sendParams.message.contextId = contextToUse;
      }
      // Method now returns Task | null directly
      const taskResult: SendMessageResponse | undefined =
        await this.client?.sendMessage(sendParams, token);

      const task: Task = taskResult?.result as Task;

      this.contextId = task.contextId;

      // Return the full task response instead of just the text
      return task;
    } catch (error) {
      // Check if it's a 401 authentication error
      if (this.isAuthError(error)) {
        console.error('🔒 Authentication error (401):', error);
        this.showSessionExpiredToast(
          '🔒 Your session has expired. Please reload the page to continue.',
        );
      }
      throw error;
    }
  }

  public async *submitA2ATaskStream(
    newContext: boolean,
    msg: string,
    sessionContextId?: string,
  ): AsyncGenerator<A2AStreamEventData, void, undefined> {
    try {
      const msgId = uuidv4();

      // Prepare message with custom call prefix first
      const processedMsg = this.prepareMessageWithCustomCall(msg);

      // Then prepare message with user email based on configured mode
      const { messageText, metadata } = await this.prepareMessageWithEmail(
        processedMsg,
      );

      const sendParams: MessageSendParams = {
        message: {
          messageId: msgId,
          role: 'user',
          parts: [{ text: messageText, kind: 'text' }],
          kind: 'message',
          metadata,
        },
      };
      const token = await this.getToken();

      // Use session contextId if provided, otherwise use internal contextId
      const contextToUse = sessionContextId || this.contextId;
      if (!newContext && contextToUse !== undefined) {
        sendParams.message.contextId = contextToUse;
      }

      // Stream responses using SSE
      if (this.client) {
        for await (const event of this.client.sendMessageStream(
          sendParams,
          token,
        )) {
          // Update internal contextId from streamed events
          // Also check if context_id is returned (snake_case) and normalize to camelCase
          const contextId =
            (event as any).contextId || (event as any).context_id;
          if (contextId) {
            console.log('🔍 CONTEXT ID:', contextId);
            // Ensure standard camelCase property exists for downstream consumers
            if (!(event as any).contextId) {
              (event as any).contextId = contextId;
            }
            if (event.kind === 'task') {
              this.contextId = contextId;
            }
          } else {
            console.log('🔍 NO CONTEXT ID');
          }
          yield event;
        }
      }
    } catch (error) {
      console.error('STREAMING ERROR:', error);
      // Check if it's a 401 authentication error
      if (this.isAuthError(error)) {
        console.error('🔒 Authentication error (401) during streaming:', error);
        this.showSessionExpiredToast(
          '🔒 Your session has expired. Please reload the page to continue.',
        );
      }
      throw error; // Let the real error bubble up instead of masking it
    }
  }

  public async getSkillExamples() {
    const card: AgentCard | undefined = await this.client?.getAgentCard();
    try {
      return card?.skills[0].examples;
    } catch (error) {
      return [];
    }
  }

  public async submitFeedback(
    message: Message,
    feedback: Feedback,
  ): Promise<void> {
    if (!this.feedbackEndpoint) {
      throw new Error('Feedback endpoint is not configured');
    }

    try {
      // always use backstage token for Jarvis
      // TODO: maybe this should be configurable
      const { token } = await this.identityApi.getCredentials();

      // Submit feedback without Authorization header to avoid CORS preflight
      const { status } = await axios.post(
        this.feedbackEndpoint,
        {
          type: feedback.type,
          reason: feedback.reason,
          additionalFeedback: feedback.additionalFeedback || '',
          timestamp: createTimestamp(),
          message: message.text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Commented out to avoid CORS preflight
            'Content-Type': 'application/json',
          },
        },
      );
      if (status !== 200) {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err?.isAxiosError) {
        throw new Error(
          `Error submitting feedback: ${[
            err.message,
            (err.cause as any)?.message,
          ]
            .filter(Boolean)
            .join(' - ')}`,
        );
      }
      throw new Error(err.message);
    }
  }

  public async cancelTask(taskId: string): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('A2A client not initialized');
      }
      const token = await this.getToken();
      await this.client.cancelTask({ id: taskId }, token);
      console.log('✅ A2A cancellation sent for task:', taskId);
    } catch (error) {
      console.error('❌ Failed to send A2A cancellation:', error);
      // Check if it's a 401 authentication error
      if (this.isAuthError(error)) {
        console.error(
          '🔒 Authentication error (401) during task cancellation:',
          error,
        );
        this.showSessionExpiredToast(
          '🔒 Your session has expired. Please reload the page to continue.',
        );
      }
      // Don't throw - cancellation is best-effort
    }
  }
}
