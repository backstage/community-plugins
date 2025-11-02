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
import { topologyTranslationRef } from './ref';

const topologyTranslationIt = createTranslationMessages({
  ref: topologyTranslationRef,
  messages: {
    // CRITICAL: Use flat dot notation, not nested objects
    'page.title': 'Topologia',
    'page.subtitle':
      'Visualizzazione della topologia dei carichi di lavoro Kubernetes',
    'toolbar.cluster': 'Cluster',
    'toolbar.selectCluster': 'Seleziona cluster',
    'toolbar.displayOptions': 'Opzioni di visualizzazione',
    'toolbar.currentDisplayOptions': 'Opzioni di visualizzazione correnti',
    'emptyState.noResourcesFound': 'Nessuna risorsa trovata',
    'emptyState.noResourcesDescription':
      'Nessuna risorsa Kubernetes è stata trovata nel cluster selezionato.',
    'permissions.missingPermission': 'Permesso mancante',
    'permissions.missingPermissionDescription':
      'Per visualizzare la topologia, il tuo amministratore deve concederti {{permissions}} {{permissionText}}.',
    'permissions.missingPermissionDescription_plural':
      'Per visualizzare la topologia, il tuo amministratore deve concederti {{permissions}} {{permissionText}}.',
    'permissions.permission': 'permesso',
    'permissions.permissions': 'permessi',
    'permissions.goBack': 'Torna indietro',
    'sideBar.details': 'Dettagli',
    'sideBar.resources': 'Risorse',
    'status.running': 'In esecuzione',
    'status.pending': 'In attesa',
    'status.succeeded': 'Riuscito',
    'status.failed': 'Fallito',
    'status.unknown': 'Sconosciuto',
    'status.terminating': 'Terminazione',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'Errore',
    'status.warning': 'Avviso',
    'status.ready': 'Pronto',
    'status.notReady': 'Non pronto',
    'status.active': 'Attivo',
    'status.inactive': 'Inattivo',
    'status.updating': 'Aggiornamento',
    'status.evicted': 'Sfrattato',
    'status.cancelled': 'Annullato',
    'details.name': 'Nome',
    'details.namespace': 'Namespace',
    'details.labels': 'Etichette',
    'details.annotations': 'Annotazioni',
    'details.createdAt': 'Creato',
    'details.age': 'Età',
    'details.replicas': 'Repliche',
    'details.availableReplicas': 'Repliche disponibili',
    'details.readyReplicas': 'Repliche pronte',
    'details.updatedReplicas': 'Repliche aggiornate',
    'details.selector': 'Selettore',
    'details.strategy': 'Strategia',
    'details.image': 'Immagine',
    'details.ports': 'Porte',
    'details.volumes': 'Volumi',
    'details.volumeMounts': 'Mount dei volumi',
    'details.environmentVariables': "Variabili d'ambiente",
    'details.resourceRequirements': 'Requisiti delle risorse',
    'details.limits': 'Limiti',
    'details.requests': 'Richieste',
    'details.cpu': 'CPU',
    'details.memory': 'Memoria',
    'details.storage': 'Archiviazione',
    'details.desiredCompletions': 'Completamenti desiderati',
    'details.parallelism': 'Parallelismo',
    'details.activeDeadlineSeconds': 'Secondi di scadenza attivi',
    'details.currentCount': 'Conteggio corrente',
    'details.desiredCount': 'Conteggio desiderato',
    'details.schedule': 'Pianificazione',
    'details.concurrencyPolicy': 'Politica di concorrenza',
    'details.startingDeadlineSeconds': 'Secondi di scadenza di avvio',
    'details.lastScheduleTime': 'Ultimo orario di pianificazione',
    'details.maxSurgeDescription': '{{maxSurge}} maggiore di {{replicas}} pod',
    'details.maxUnavailableDescription':
      '{{maxUnavailable}} di {{replicas}} pod',
    'logs.download': 'Scarica',
    'logs.noLogsFound': 'Nessun log trovato',
    'logs.selectContainer': 'Seleziona container',
    'logs.container': 'Container',
    'logs.pod': 'Pod',
    'logs.showPrevious': 'Mostra precedente',
    'logs.follow': 'Segui',
    'logs.refresh': 'Aggiorna',
    'logs.timestamps': 'Timestamp',
    'logs.wrapLines': 'A capo automatico',
    'logs.clearLogs': 'Cancella log',
    'logs.logLevel': 'Livello di log',
    'logs.search': 'Cerca',
    'logs.noMatchingLogs': 'Nessun log corrispondente trovato',
    'resources.noResourcesFound':
      'Nessun {{resourceType}} trovato per questa risorsa.',
    'resources.showingLatest':
      'Mostrando gli ultimi {{count}} {{resourceType}}',
    'time.seconds': 'secondi',
    'time.minutes': 'minuti',
    'time.hours': 'ore',
    'time.days': 'giorni',
    'events.type': 'Tipo',
    'events.reason': 'Motivo',
    'events.message': 'Messaggio',
    'events.source': 'Origine',
    'events.firstSeen': 'Visto per la prima volta',
    'events.lastSeen': "Visto per l'ultima volta",
    'events.count': 'Conteggio',
    'events.noEventsFound': 'Nessun evento trovato',
    'filters.showLabels': 'Mostra etichette',
    'filters.showPodCount': 'Mostra conteggio pod',
    'filters.expandApplicationGroups': 'Espandi gruppi applicazioni',
    'filters.showConnectors': 'Mostra connettori',
    'common.status': 'Stato',
    'common.owner': 'Proprietario',
    'common.location': 'Posizione',
    'common.viewLogs': 'Visualizza log',
    'bootOrder.summary': 'Riepilogo ordine di avvio',
    'bootOrder.emptySummary': 'Nessun ordine di avvio configurato',
    'bootOrder.disk': 'Disco',
    'bootOrder.network': 'Rete',
    'bootOrder.cdrom': 'CD-ROM',
    'vm.status.starting': 'Avvio',
    'vm.status.stopping': 'Arresto',
    'vm.status.stopped': 'Fermato',
    'vm.status.paused': 'In pausa',
    'vm.status.migrating': 'Migrazione',
    'vm.status.provisioning': 'Provisioning',
    'vm.status.errorUnschedulable': 'Errore non programmabile',
    'vm.status.errorImagePull': 'Errore pull immagine',
    'vm.status.imageNotReady': 'Immagine non pronta',
    'vm.status.waitingForVolumeBinding': 'In attesa del binding del volume',
  },
});

export default topologyTranslationIt;
