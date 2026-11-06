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
 * Italian translation of the guided tours plugin.
 *
 * @alpha
 */
const guidedToursTranslationIt = createTranslationMessages({
  ref: guidedTourTranslationRef,
  messages: {
    'overlay.previous': 'Indietro',
    'overlay.next': 'Avanti',
    'overlay.done': 'Fatto',
    'overlay.close': 'Chiudi il tour',
    'overlay.counter': 'Passo {{current}} di {{total}}',
    'overlay.clickToContinue':
      'Fai clic sull’elemento evidenziato per continuare.',
    'overlay.loading': 'Ricerca del passo successivo…',
    'overlay.contentError': 'Non è stato possibile mostrare questo passo.',
    'page.title': 'Tour guidati',
    'page.description':
      'Ripeti qualsiasi tour in qualsiasi momento. I tour previsti all’accesso partono da soli al tuo primo accesso.',
    'page.empty': 'Nessun tour guidato è installato.',
    'page.steps': '{{n}} passi',
    'page.start': 'Avvia',
    'page.continue': 'Continua',
    'page.restart': 'Ricomincia',
    'page.resetAll': 'Reimposta tutti i tour',
    'page.resetAllTitle': 'Reimpostare tutti i tour?',
    'page.resetAllBody':
      'I progressi di tutti i tour vengono cancellati e i tour di benvenuto verranno riprodotti di nuovo alla prossima visita.',
    'page.cancel': 'Annulla',
    'page.confirm': 'Reimposta',
    'page.autoStartLogin': 'Parte all’accesso',
    'page.autoStartPath': 'Parte alla prima visita di {{path}}',
    'page.status.new': 'Nuovo',
    'page.status.inProgress': 'In corso',
    'page.status.completed': 'Completato',
    'page.status.dismissed': 'Ignorato',
  },
});

export default guidedToursTranslationIt;
