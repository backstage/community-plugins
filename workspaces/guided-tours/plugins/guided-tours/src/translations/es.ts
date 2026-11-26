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
 * Spanish translation of the guided tours plugin.
 *
 * @alpha
 */
const guidedToursTranslationEs = createTranslationMessages({
  ref: guidedTourTranslationRef,
  messages: {
    'overlay.previous': 'Anterior',
    'overlay.next': 'Siguiente',
    'overlay.done': 'Hecho',
    'overlay.close': 'Cerrar el recorrido',
    'overlay.counter': 'Paso {{current}} de {{total}}',
    'overlay.clickToContinue':
      'Haga clic en el elemento resaltado para continuar.',
    'overlay.loading': 'Buscando el siguiente paso…',
    'overlay.contentError': 'No se pudo mostrar este paso.',
    'page.title': 'Recorridos guiados',
    'page.description':
      'Repita cualquier recorrido en cualquier momento. Los recorridos marcados para el inicio de sesión comienzan solos la primera vez que inicia sesión.',
    'page.empty': 'No hay recorridos guiados instalados.',
    'page.steps': '{{n}} pasos',
    'page.start': 'Iniciar',
    'page.continue': 'Continuar',
    'page.restart': 'Reiniciar',
    'page.resetAll': 'Restablecer todos los recorridos',
    'page.resetAllTitle': '¿Restablecer todos los recorridos?',
    'page.resetAllBody':
      'Se borra el progreso de todos los recorridos y los recorridos de bienvenida se reproducen de nuevo en su próxima visita.',
    'page.cancel': 'Cancelar',
    'page.confirm': 'Restablecer',
    'page.autoStartLogin': 'Comienza al iniciar sesión',
    'page.autoStartPath': 'Comienza en la primera visita a {{path}}',
    'page.status.new': 'Nuevo',
    'page.status.inProgress': 'En curso',
    'page.status.completed': 'Completado',
    'page.status.dismissed': 'Descartado',
  },
});

export default guidedToursTranslationEs;
