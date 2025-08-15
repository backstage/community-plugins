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

import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';
import { bookmarksTranslationRef } from './translations';

/**
 * Translation in de-DE (German, Germany)
 */
/* istanbul ignore next: ignore coverage because this is a translation file */
export const de = createTranslationMessages({
  ref: bookmarksTranslationRef,
  full: true, // False means that this is a partial translation
  messages: {
    'bookmarkViewer.newTab': 'In neuem Tab öffnen',
    'bookmarkViewer.navButton.next': 'Weiter',
    'bookmarkViewer.navButton.previous': 'Zurück',
    'bookmarkViewer.mobileView.toc': 'Inhaltsverzeichnis',
    'bookmarkViewerFrame.devModeWarning':
      'Sie müssen die Seite möglicherweise neu laden, damit das iFrame im Entwicklungsmodus korrekt geladen wird',
    'entityBookmarksContent.invalid.title': 'Ungültiges Bookmarks-Format',
    'entityBookmarksContent.invalid.description':
      'Stellen Sie sicher, dass Ihre Bookmark-Links das richtige Format verwenden.',
    'entityBookmarksContent.notFound.title': 'Keine Bookmarks gefunden',
    'entityBookmarksContent.notFound.description':
      'Fügen Sie ihrem Software-Katalog Eintrag Bookmarks hinzu, um sie hier anzuzeigen.',
  },
});
