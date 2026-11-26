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
import { createTranslationMessages } from '@backstage/frontend-plugin-api';
import { guidedTourTranslationRef } from './ref';

/**
 * German translation of the guided tours plugin.
 *
 * @alpha
 */
const guidedToursTranslationDe = createTranslationMessages({
  ref: guidedTourTranslationRef,
  messages: {
    'overlay.previous': 'Zurück',
    'overlay.next': 'Weiter',
    'overlay.done': 'Fertig',
    'overlay.close': 'Tour schließen',
    'overlay.counter': 'Schritt {{current}} von {{total}}',
    'overlay.clickToContinue':
      'Klicken Sie auf das hervorgehobene Element, um fortzufahren.',
    'overlay.loading': 'Nächster Schritt wird gesucht…',
    'overlay.contentError': 'Dieser Schritt konnte nicht angezeigt werden.',
    'page.title': 'Geführte Touren',
    'page.description':
      'Jede Tour kann jederzeit wiederholt werden. Touren für die Anmeldung starten bei Ihrer ersten Anmeldung von selbst.',
    'page.empty': 'Es sind keine geführten Touren installiert.',
    'page.steps': '{{n}} Schritte',
    'page.start': 'Starten',
    'page.continue': 'Fortsetzen',
    'page.restart': 'Neu starten',
    'page.resetAll': 'Alle Touren zurücksetzen',
    'page.resetAllTitle': 'Alle Touren zurücksetzen?',
    'page.resetAllBody':
      'Der Fortschritt aller Touren wird gelöscht und die Willkommenstouren werden beim nächsten Besuch erneut abgespielt.',
    'page.cancel': 'Abbrechen',
    'page.confirm': 'Zurücksetzen',
    'page.autoStartLogin': 'Startet bei der Anmeldung',
    'page.autoStartPath': 'Startet beim ersten Besuch von {{path}}',
    'page.status.new': 'Neu',
    'page.status.inProgress': 'In Bearbeitung',
    'page.status.completed': 'Abgeschlossen',
    'page.status.dismissed': 'Übersprungen',
  },
});

export default guidedToursTranslationDe;
