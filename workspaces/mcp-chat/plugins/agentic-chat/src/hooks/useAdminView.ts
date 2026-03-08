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

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_MODE = 'agentic-chat:view-mode';
const STORAGE_KEY_BANNER = 'agentic-chat:admin-banner-seen';

export type ViewMode = 'chat' | 'admin';
export type AdminPanel = 'agent' | 'branding';

export interface UseAdminViewOptions {
  isAdmin: boolean;
}

export interface UseAdminViewReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  adminPanel: AdminPanel;
  setAdminPanel: (panel: AdminPanel) => void;
  showAdminBanner: boolean;
  setShowAdminBanner: (show: boolean) => void;
  switchToAdmin: () => void;
  switchToChat: () => void;
  dismissAdminBanner: () => void;
}

/**
 * Hook to manage admin view state (chat vs admin mode, panel selection, banner visibility).
 * Persists view mode and banner-seen state to localStorage when user is admin.
 */
export function useAdminView({
  isAdmin,
}: UseAdminViewOptions): UseAdminViewReturn {
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [adminPanel, setAdminPanel] = useState<AdminPanel>('agent');
  const [showAdminBanner, setShowAdminBanner] = useState(false);

  // localStorage persistence for admin mode
  useEffect(() => {
    if (!isAdmin) return;
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
      if (savedMode === 'admin') setViewMode('admin');
      const bannerSeen = localStorage.getItem(STORAGE_KEY_BANNER);
      if (!bannerSeen) setShowAdminBanner(true);
    } catch {
      // localStorage unavailable
    }
  }, [isAdmin]);

  const switchToAdmin = useCallback(() => {
    setViewMode('admin');
    setShowAdminBanner(false);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, 'admin');
      localStorage.setItem(STORAGE_KEY_BANNER, '1');
    } catch {
      // localStorage unavailable
    }
  }, []);

  const switchToChat = useCallback(() => {
    setViewMode('chat');
    try {
      localStorage.setItem(STORAGE_KEY_MODE, 'chat');
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismissAdminBanner = useCallback(() => {
    setShowAdminBanner(false);
    try {
      localStorage.setItem(STORAGE_KEY_BANNER, '1');
    } catch {
      // localStorage unavailable
    }
  }, []);

  return {
    viewMode,
    setViewMode,
    adminPanel,
    setAdminPanel,
    showAdminBanner,
    setShowAdminBanner,
    switchToAdmin,
    switchToChat,
    dismissAdminBanner,
  };
}
