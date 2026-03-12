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
 * de translation for plugin.topology.
 * @public
 */
const topologyTranslationDe = createTranslationMessages({
  ref: topologyTranslationRef,
  messages: {
    'page.title': 'Topologie',
    'page.subtitle': 'Visualisierung der Kubernetes-Workload-Topologie',
    'toolbar.cluster': 'Cluster',
    'toolbar.selectCluster': 'Cluster auswählen',
    'toolbar.displayOptions': 'Anzeigeoptionen',
    'toolbar.currentDisplayOptions': 'Aktuelle Anzeigeoptionen',
    'controlBar.zoomIn': 'Vergrößern',
    'controlBar.zoomOut': 'Verkleinern',
    'controlBar.fitToScreen': 'An Bildschirm anpassen',
    'controlBar.resetView': 'Ansicht zurücksetzen',
    'emptyState.noResourcesFound': 'Keine Ressourcen gefunden',
    'emptyState.noResourcesDescription':
      'Im ausgewählten Cluster wurden keine Kubernetes-Ressourcen gefunden.',
    'permissions.missingPermission': 'Fehlende Berechtigung',
    'permissions.missingPermissionDescription':
      'Um die Topologie anzuzeigen, muss Ihr Administrator Ihnen {{permissions}} {{permissionText}} erteilen.',
    'permissions.missingPermissionDescription_plural':
      'Um die Topologie anzuzeigen, muss Ihr Administrator Ihnen {{permissions}} {{permissionText}} erteilen.',
    'permissions.permission': 'Berechtigung',
    'permissions.permissions': 'Berechtigungen',
    'permissions.goBack': 'Zurück',
    'sideBar.details': 'Details',
    'sideBar.resources': 'Ressourcen',
    'status.running': 'Wird ausgeführt',
    'status.pending': 'Ausstehend',
    'status.succeeded': 'Erfolgreich',
    'status.failed': 'Fehlgeschlagen',
    'status.unknown': 'Unbekannt',
    'status.terminating': 'Beendigung',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'Fehler',
    'status.warning': 'Warnung',
    'status.ready': 'Bereit',
    'status.notReady': 'Nicht bereit',
    'status.active': 'Aktiv',
    'status.inactive': 'Inaktiv',
    'status.updating': 'Aktualisierung',
    'status.evicted': 'Entfernt',
    'status.cancelled': 'Abgebrochen',
    'details.name': 'Name',
    'details.namespace': 'Namespace',
    'details.labels': 'Bezeichnungen',
    'details.annotations': 'Anmerkungen',
    'details.createdAt': 'Erstellt',
    'details.age': 'Alter',
    'details.replicas': 'Replikate',
    'details.availableReplicas': 'Verfügbare Replikate',
    'details.readyReplicas': 'Fertige Replikate',
    'details.updatedReplicas': 'Aktualisierte Replikate',
    'details.selector': 'Auswahl',
    'details.strategy': 'Strategie',
    'details.image': 'Image',
    'details.ports': 'Ports',
    'details.volumes': 'Volumes',
    'details.volumeMounts': 'Volume-Mounts',
    'details.environmentVariables': 'Umgebungsvariablen',
    'details.resourceRequirements': 'Ressourcenanforderungen',
    'details.limits': 'Limits',
    'details.requests': 'Anforderungen',
    'details.cpu': 'CPU',
    'details.memory': 'Arbeitsspeicher',
    'details.storage': 'Storage',
    'details.noLabels': 'Keine Bezeichnungen',
    'details.noAnnotations': 'Keine Anmerkungen',
    'details.noOwner': 'Kein Eigentümer',
    'details.notAvailable': 'Nicht verfügbar',
    'details.notConfigured': 'Nicht konfiguriert',
    'details.updateStrategy': 'Strategie aktualisieren',
    'details.maxUnavailable': 'Max. nicht verfügbar',
    'details.maxSurge': 'Max. plötzlicher Anstieg',
    'details.progressDeadlineSeconds': 'Fortschrittsfrist in Sekunden',
    'details.minReadySeconds': 'Mind. bereit in Sekunden',
    'details.desiredCompletions': 'Gewünschte Fertigstellungen',
    'details.parallelism': 'Parallelität',
    'details.activeDeadlineSeconds': 'Aktive Frist Sekunden',
    'details.currentCount': 'Aktuelle Anzahl',
    'details.desiredCount': 'Gewünschte Anzahl',
    'details.schedule': 'Zeitplan',
    'details.concurrencyPolicy': 'Parallelitätsrichtlinie',
    'details.startingDeadlineSeconds': 'Startfrist Sekunden',
    'details.lastScheduleTime': 'Letzte Planzeit',
    'details.maxSurgeDescription': '{{maxSurge}} größer als {{replicas}} Pod',
    'details.maxUnavailableDescription':
      '{{maxUnavailable}} von {{replicas}} Pod',
    'logs.download': 'Herunterladen',
    'logs.noLogsFound': 'Keine Logs gefunden',
    'logs.selectContainer': 'Container auswählen',
    'logs.container': 'Container',
    'logs.pod': 'Pod',
    'logs.showPrevious': 'Vorherige anzeigen',
    'logs.follow': 'Folgen',
    'logs.refresh': 'Aktualisieren',
    'logs.timestamps': 'Zeitstempel',
    'logs.wrapLines': 'Zeilenumbruch',
    'logs.clearLogs': 'Logs löschen',
    'logs.logLevel': 'Log-Ebene',
    'logs.search': 'Suchen',
    'logs.noMatchingLogs': 'Keine passenden Logs gefunden',
    'resources.noResourcesFound':
      'Für diese Ressource wurde kein {{resourceType}} gefunden.',
    'resources.showingLatest':
      'Anzeige der neuesten {{count}} {{resourceType}}',
    'time.seconds': 'Sekunden',
    'time.minutes': 'Minuten',
    'time.hours': 'Stunden',
    'time.days': 'Tage',
    'events.type': 'Typ',
    'events.reason': 'Ursache',
    'events.message': 'Nachricht',
    'events.source': 'Quelle',
    'events.firstSeen': 'Zuerst gesehen',
    'events.lastSeen': 'Zuletzt gesehen',
    'events.count': 'Anzahl',
    'events.noEventsFound': 'Keine Ereignisse gefunden',
    'filters.showLabels': 'Bezeichnungen anzeigen',
    'filters.showPodCount': 'Pod-Anzahl anzeigen',
    'filters.expandApplicationGroups': 'Anwendungsgruppen erweitern',
    'filters.showConnectors': 'Konnektoren anzeigen',
    'common.status': 'Status',
    'common.owner': 'Eigentümer',
    'common.location': 'Speicherort',
    'common.viewLogs': 'Logs anzeigen',
    'bootOrder.summary': 'Zusammenfassung der Bootreihenfolge',
    'bootOrder.emptySummary': 'Keine Bootreihenfolge konfiguriert',
    'bootOrder.disk': 'Disk',
    'bootOrder.network': 'Netzwerk',
    'bootOrder.cdrom': 'CD-ROM',
    'vm.status.starting': 'Wird gestartet',
    'vm.status.stopping': 'Wird beendet',
    'vm.status.stopped': 'Beendet',
    'vm.status.paused': 'Pausiert',
    'vm.status.migrating': 'Migration',
    'vm.status.provisioning': 'Bereitstellung',
    'vm.status.errorUnschedulable': 'ErrorUnschedulable',
    'vm.status.errorImagePull': 'ErrorImagePull',
    'vm.status.imageNotReady': 'ImageNotReady',
    'vm.status.waitingForVolumeBinding': 'WaitingForVolumeBinding',
  },
});

export default topologyTranslationDe;
