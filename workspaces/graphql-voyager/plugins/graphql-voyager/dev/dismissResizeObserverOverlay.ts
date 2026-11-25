/*
 * Copyright 2026 The Backstage Authors
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

/**
 * Local-dev only: graphql-voyager redraws (tabs, "Sort by Alphabet", etc.) can
 * emit a benign "ResizeObserver loop..." browser notification. The rspack /
 * webpack-dev-server overlay treats it as a fatal runtime error and registers
 * its listener before the app bundle, so window error filtering cannot stop it.
 *
 * Auto-remove that specific overlay iframe when it appears. Real runtime errors
 * still show normally. Not included in the published package (`files: ["dist"]`).
 */
const OVERLAY_ID = 'webpack-dev-server-client-overlay';
const RESIZE_OBSERVER_HINT = 'ResizeObserver loop';

function overlayText(iframe: HTMLIFrameElement): string {
  try {
    return iframe.contentDocument?.body?.innerText ?? '';
  } catch {
    return '';
  }
}

function dismissIfResizeObserverOverlay(iframe: HTMLIFrameElement) {
  if (overlayText(iframe).includes(RESIZE_OBSERVER_HINT)) {
    iframe.remove();
    return true;
  }
  return false;
}

function watchOverlayIframe(iframe: HTMLIFrameElement) {
  if (dismissIfResizeObserverOverlay(iframe)) {
    return;
  }

  const check = () => dismissIfResizeObserverOverlay(iframe);

  iframe.addEventListener('load', () => {
    if (check()) {
      return;
    }
    const doc = iframe.contentDocument;
    if (!doc?.documentElement) {
      return;
    }
    const inner = new MutationObserver(() => {
      if (check()) {
        inner.disconnect();
      }
    });
    inner.observe(doc.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });

  // Content is often written shortly after the iframe is attached.
  const polls = [0, 50, 100, 250, 500].map(ms => window.setTimeout(check, ms));
  iframe.addEventListener(
    'load',
    () => polls.forEach(id => window.clearTimeout(id)),
    { once: true },
  );
}

export function dismissResizeObserverOverlay() {
  document
    .querySelectorAll<HTMLIFrameElement>(`iframe#${OVERLAY_ID}`)
    .forEach(watchOverlayIframe);

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLIFrameElement && node.id === OVERLAY_ID) {
          watchOverlayIframe(node);
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
