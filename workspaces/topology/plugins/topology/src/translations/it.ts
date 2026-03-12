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
    'toolbar.selectCluster': 'Selezionare Cluster',
    'toolbar.displayOptions': 'Opzioni di visualizzazione',
    'toolbar.currentDisplayOptions': 'Opzioni di visualizzazione correnti',
    'emptyState.noResourcesFound': 'Nessuna risorsa trovata',
    'emptyState.noResourcesDescription':
      'Nessuna risorsa Kubernetes trovata nel cluster selezionato.',
    'permissions.missingPermission': 'Autorizzazione mancante',
    'permissions.missingPermissionDescription':
      "Per visualizzare la topologia, l'amministratore deve concedere {{permissions}} {{permissionText}}.",
    'permissions.missingPermissionDescription_plural':
      "Per visualizzare la topologia, l'amministratore deve concedere {{permissions}} {{permissionText}}.",
    'permissions.permission': 'autorizzazione',
    'permissions.permissions': 'autorizzazioni',
    'permissions.goBack': 'Indietro',
    'sideBar.details': 'Dettagli',
    'sideBar.resources': 'Risorse',
    'status.running': 'In esecuzione',
    'status.pending': 'In pausa',
    'status.succeeded': 'Riuscito',
    'status.failed': 'Non riuscito',
    'status.unknown': 'Sconosciuto',
    'status.terminating': 'Termine',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'Errore',
    'status.warning': 'Avviso',
    'status.ready': 'Pronto',
    'status.notReady': 'Non pronto',
    'status.active': 'Attivo',
    'status.inactive': 'Inattivo',
    'status.updating': 'Aggiornamento',
    'status.evicted': 'Rimosso',
    'status.cancelled': 'Annullato',
    'details.name': 'Nome',
    'details.namespace': 'Spazio dei nomi',
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
    'details.volumeMounts': 'Montaggi del volume',
    'details.environmentVariables': "Variabili d'ambiente",
    'details.resourceRequirements': 'Requisiti delle risorse',
    'details.limits': 'Limiti',
    'details.requests': 'Richieste',
    'details.cpu': 'CPU',
    'details.memory': 'Memoria',
    'details.storage': 'Archiviazione',
    'details.noLabels': 'Nessuna etichetta',
    'details.noAnnotations': 'Nessuna annotazione',
    'details.noOwner': 'Nessun proprietario',
    'details.notAvailable': 'Non disponibile',
    'details.notConfigured': 'Non configurato',
    'details.updateStrategy': 'Aggiornare la strategia',
    'details.maxUnavailable': 'Max non disponibile',
    'details.maxSurge': 'Sovratensione massima',
    'details.progressDeadlineSeconds': 'Secondi alla scadenza progressivi',
    'details.minReadySeconds': 'Secondi min alla preparazione',
    'details.desiredCompletions': 'Completamenti desiderati',
    'details.parallelism': 'Parallelismo',
    'details.activeDeadlineSeconds': 'Secondi alla scadenza attivi',
    'details.currentCount': 'Conteggio attuale',
    'details.desiredCount': 'Conteggio desiderato',
    'details.schedule': 'Programma',
    'details.concurrencyPolicy': 'Politica di concorrenza',
    'details.startingDeadlineSeconds': "Secondi all'avvio della scadenza",
    'details.lastScheduleTime': 'Ultimo orario previsto',
    'details.maxSurgeDescription': '{{maxSurge}} maggiore di {{replicas}} pod',
    'details.maxUnavailableDescription':
      '{{maxUnavailable}} di {{replicas}} pod',
    'logs.download': 'Scaricamento',
    'logs.noLogsFound': 'Nessun registro trovato',
    'logs.selectContainer': 'Selezionare container',
    'logs.container': 'Container',
    'logs.pod': 'Pod',
    'logs.showPrevious': 'Mostra precedente',
    'logs.follow': 'Segui',
    'logs.refresh': 'Aggiorna',
    'logs.timestamps': 'Timestamp',
    'logs.wrapLines': 'A capo',
    'logs.clearLogs': 'Cancella registri',
    'logs.logLevel': 'Livello di registro',
    'logs.search': 'Ricerca',
    'logs.noMatchingLogs': 'Nessun registro corrispondente trovato',
    'resources.noResourcesFound':
      'Nessun {{resourceType}} trovato per questa risorsa.',
    'resources.showingLatest':
      'Visualizzazione degli ultimi {{count}} {{resourceType}}',
    'time.seconds': 'secondi',
    'time.minutes': 'minuti',
    'time.hours': 'ore',
    'time.days': 'giorni',
    'events.type': 'Tipo',
    'events.reason': 'Motivo',
    'events.message': 'Messaggio',
    'events.source': 'Sorgente',
    'events.firstSeen': 'Primo accesso',
    'events.lastSeen': 'Ultimo accesso',
    'events.count': 'Conteggio',
    'events.noEventsFound': 'Nessun evento trovato',
    'filters.showLabels': 'Mostra etichette',
    'filters.showPodCount': 'Mostra conteggio pod',
    'filters.expandApplicationGroups': 'Espandi gruppi di applicazioni',
    'filters.showConnectors': 'Mostra connettori',
    'common.status': 'Stato',
    'common.owner': 'Proprietario',
    'common.location': 'Posizione',
    'common.viewLogs': 'Visualizza registri',
    'bootOrder.summary': "Riepilogo dell'ordine di avvio",
    'bootOrder.emptySummary': 'Nessun ordine di avvio configurato',
    'bootOrder.disk': 'Disco',
    'bootOrder.network': 'Rete',
    'bootOrder.cdrom': 'CD-ROM',
    'vm.status.starting': 'Avvio',
    'vm.status.stopping': 'Arresto',
    'vm.status.stopped': 'Arrestato',
    'vm.status.paused': 'In pausa',
    'vm.status.migrating': 'Migrazione',
    'vm.status.provisioning': 'Provisioning',
    'vm.status.errorUnschedulable': 'ErrorUnschedulable',
    'vm.status.errorImagePull': 'ErrorImagePull',
    'vm.status.imageNotReady': 'ImageNotReady',
    'vm.status.waitingForVolumeBinding': 'WaitingForVolumeBinding',
  },
});

export default topologyTranslationIt;
