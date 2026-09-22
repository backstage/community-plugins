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

import { createTranslationMessages } from '@backstage/frontend-plugin-api';
import { topologyTranslationRef } from './ref';

/**
 * Italian translation for plugin.topology.
 * @public
 */
const topologyTranslationIt = createTranslationMessages({
  ref: topologyTranslationRef,
  messages: {
    'page.title': 'Topologia',
    'page.subtitle':
      'Visualizzazione della topologia del carico di lavoro di Kubernetes',
    'toolbar.cluster': 'Cluster',
    'toolbar.selectCluster': 'Seleziona il cluster',
    'toolbar.displayOptions': 'Opzioni di visualizzazione',
    'toolbar.currentDisplayOptions': 'Opzioni di visualizzazione attuali',
    'controlBar.zoomIn': 'Ingrandisci',
    'controlBar.zoomOut': 'Riduci',
    'controlBar.fitToScreen': 'Adatta allo schermo',
    'controlBar.resetView': 'Ripristina la vista',
    'emptyState.noResourcesFound': 'Nessuna risorsa trovata',
    'emptyState.noResourcesDescription':
      'Nel cluster selezionato non sono state trovate risorse Kubernetes.',
    'permissions.missingPermission': 'Autorizzazione mancante',
    'permissions.missingPermissionDescription':
      "Per visualizzare la topologia, l'amministratore deve concederti le autorizzazioni {{permissions}} {{permissionText}}.",
    'permissions.missingPermissionDescription_plural':
      "Per visualizzare la topologia, l'amministratore deve concederti le autorizzazioni {{permissions}} {{permissionText}}.",
    'permissions.permission': 'autorizzazione',
    'permissions.permissions': 'autorizzazioni',
    'permissions.goBack': 'Torna indietro',
    'sideBar.details': 'Dettagli',
    'sideBar.resources': 'Risorse',
    'status.running': 'In esecuzione',
    'status.pending': 'In sospeso',
    'status.succeeded': 'Riuscito',
    'status.failed': 'Non riuscito',
    'status.unknown': 'Sconosciuto',
    'status.terminating': 'Conclusione',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'Errore',
    'status.warning': 'Avviso',
    'status.ready': 'Pronto',
    'status.notReady': 'Non pronto',
    'status.active': 'Attivo',
    'status.inactive': 'Inattivo',
    'status.updating': 'In aggiornamento',
    'status.evicted': 'Rimosso',
    'status.cancelled': 'Annullato',
    'details.name': 'Nome',
    'details.namespace': 'Namespace',
    'details.labels': 'Etichette',
    'details.annotations': 'Annotazioni',
    'details.createdAt': 'Creata',
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
    'details.volumeMounts': 'Montaggi volume',
    'details.environmentVariables': 'Variabili ambientali',
    'details.resourceRequirements': 'Requisiti delle risorse',
    'details.limits': 'Limiti',
    'details.requests': 'Richieste',
    'details.cpu': 'CPU',
    'details.memory': 'Memoria',
    'details.storage': 'Storage',
    'details.noLabels': 'Nessuna etichetta',
    'details.noAnnotations': 'Nessuna annotazione',
    'details.noOwner': 'Nessun proprietario',
    'details.notAvailable': 'Non disponibile',
    'details.notConfigured': 'Non configurato',
    'details.updateStrategy': 'Strategia di aggiornamento',
    'details.maxUnavailable': 'Max non disponibile',
    'details.maxSurge': 'Picco massimo',
    'details.progressDeadlineSeconds': 'Scadenza progressiva secondi',
    'details.minReadySeconds': 'Preparazione min secondi',
    'details.desiredCompletions': 'Completamenti desiderati',
    'details.parallelism': 'Parallelismo',
    'details.activeDeadlineSeconds': 'Scadenza attiva secondi',
    'details.currentCount': 'Conteggio attuale',
    'details.desiredCount': 'Conteggio desiderato',
    'details.schedule': 'Programma',
    'details.concurrencyPolicy': 'Criterio di concorrenza',
    'details.startingDeadlineSeconds': 'Scadenza inizio secondi',
    'details.lastScheduleTime': 'Ultimo orario previsto',
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
    'logs.wrapLines': 'Comprimi righe',
    'logs.clearLogs': 'Cancella log',
    'logs.logLevel': 'Livello di log',
    'logs.search': 'Cerca',
    'logs.noMatchingLogs': 'Nessun log corrispondente trovato',
    'resources.noResourcesFound':
      'Nessun {{resourceType}} trovato per questa risorsa.',
    'resources.showingLatest':
      'Vengono mostrati gli ultimi {{count}} {{resourceType}}',
    'time.seconds': 'secondi',
    'time.minutes': 'minuti',
    'time.hours': 'ore',
    'time.days': 'giorni',
    'events.type': 'Tipo',
    'events.reason': 'Motivo',
    'events.message': 'Messaggio',
    'events.source': 'Fonte',
    'events.firstSeen': 'Prima visualizzazione',
    'events.lastSeen': 'Ultima visualizzazione',
    'events.count': 'Conteggio',
    'events.noEventsFound': 'Nessun evento trovato',
    'filters.showLabels': 'Mostra etichette',
    'filters.showPodCount': 'Mostra numero di pod',
    'filters.expandApplicationGroups': 'Espandi gruppi di applicazioni',
    'filters.showConnectors': 'Mostra connettori',
    'common.status': 'Stato',
    'common.owner': 'Proprietario',
    'common.location': 'Posizione',
    'common.viewLogs': 'Visualizza log',
    'bootOrder.summary': "Riepilogo dell'ordine di avvio",
    'bootOrder.emptySummary': 'Nessun ordine di avvio configurato',
    'bootOrder.disk': 'Disco',
    'bootOrder.network': 'Rete',
    'bootOrder.cdrom': 'CD-ROM',
    'vm.status.starting': 'In fase di avvio',
    'vm.status.stopping': 'In fase di arresto',
    'vm.status.stopped': 'Arrestato',
    'vm.status.paused': 'In pausa',
    'vm.status.migrating': 'In fase di migrazione',
    'vm.status.provisioning': 'In fase di provisioning',
    'vm.status.errorUnschedulable': 'Errore non pianificabile',
    'vm.status.errorImagePull': 'ErrorImagePull',
    'vm.status.imageNotReady': 'ImageNotReady',
    'vm.status.waitingForVolumeBinding': 'WaitingForVolumeBinding',
  },
});

export default topologyTranslationIt;
