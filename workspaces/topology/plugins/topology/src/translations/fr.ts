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
 * fr translation for plugin.topology.
 * @public
 */
const topologyTranslationFr = createTranslationMessages({
  ref: topologyTranslationRef,
  messages: {
    'page.title': 'Topologie',
    'page.subtitle':
      'Visualisation de la topologie de la charge de travail Kubernetes',
    'toolbar.cluster': 'Cluster',
    'toolbar.selectCluster': 'Sélectionner un cluster',
    'toolbar.displayOptions': "Options d'affichage",
    'toolbar.currentDisplayOptions': "Options d'affichage actuelles",
    'emptyState.noResourcesFound': 'Aucune ressource trouvée',
    'emptyState.noResourcesDescription':
      'Aucune ressource Kubernetes n’a été trouvée dans le cluster sélectionné.',
    'permissions.missingPermission': 'Autorisation manquante',
    'permissions.missingPermissionDescription':
      'Pour afficher la topologie, votre administrateur doit vous accorder {{permissions}} {{permissionText}}.',
    'permissions.missingPermissionDescription_plural':
      'Pour afficher la topologie, votre administrateur doit vous accorder {{permissions}} {{permissionText}}.',
    'permissions.permission': 'autorisation',
    'permissions.permissions': 'autorisations',
    'permissions.goBack': 'Retour',
    'sideBar.details': 'Détails',
    'sideBar.resources': 'Ressources',
    'status.running': "En cours d'exécution",
    'status.pending': 'En attente',
    'status.succeeded': 'Réussi',
    'status.failed': 'Échoué',
    'status.unknown': 'Inconnu',
    'status.terminating': 'Terminer',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'Erreur',
    'status.warning': 'Attention',
    'status.ready': 'Prêt',
    'status.notReady': 'Pas prêt',
    'status.active': 'Actif',
    'status.inactive': 'Inactif',
    'status.updating': 'Mise à jour',
    'status.evicted': 'Expulsé',
    'status.cancelled': 'Annulé',
    'details.name': 'Nom',
    'details.namespace': 'Espace de noms',
    'details.labels': 'Étiquettes',
    'details.annotations': 'Annotations',
    'details.createdAt': 'Créé',
    'details.age': 'Âge',
    'details.replicas': 'Répliques',
    'details.availableReplicas': 'Répliques disponibles',
    'details.readyReplicas': 'Répliques prêtes',
    'details.updatedReplicas': 'Répliques mises à jour',
    'details.selector': 'Sélecteur',
    'details.strategy': 'Stratégie',
    'details.image': 'Image',
    'details.ports': 'Ports',
    'details.volumes': 'Volumes',
    'details.volumeMounts': 'Montages de volume',
    'details.environmentVariables': "Variables d'environnement",
    'details.resourceRequirements': 'Besoins en ressources',
    'details.limits': 'Limites',
    'details.requests': 'Demandes',
    'details.cpu': 'CPU',
    'details.memory': 'Mémoire',
    'details.storage': 'Stockage',
    'details.noLabels': 'Aucune étiquette',
    'details.noAnnotations': 'Aucune annotation',
    'details.noOwner': 'Pas de propriétaire',
    'details.notAvailable': 'Non disponible',
    'details.notConfigured': 'Non configuré',
    'details.updateStrategy': 'Mettre à jour la stratégie',
    'details.maxUnavailable': 'Max indisponible',
    'details.maxSurge': 'Surtension maximale',
    'details.progressDeadlineSeconds': 'Délai de progression en secondes',
    'details.minReadySeconds': 'Minutes de disponibilité en secondes',
    'details.desiredCompletions': 'Complétions souhaitées',
    'details.parallelism': 'Parallélisme',
    'details.activeDeadlineSeconds': 'Secondes du délai actif',
    'details.currentCount': 'Nombre actuel',
    'details.desiredCount': 'Nombre souhaité',
    'details.schedule': 'Calendrier',
    'details.concurrencyPolicy': 'Politique de concurrence',
    'details.startingDeadlineSeconds': 'Délai de départ secondes',
    'details.lastScheduleTime': 'Dernière heure prévue',
    'details.maxSurgeDescription': '{{maxSurge}} supérieur à {{replicas}} pod',
    'details.maxUnavailableDescription':
      '{{maxUnavailable}} de {{replicas}} pod',
    'logs.download': 'Télécharger',
    'logs.noLogsFound': 'Aucun journal trouvé',
    'logs.selectContainer': 'Sélectionner le conteneur',
    'logs.container': 'Récipient',
    'logs.pod': 'Pod',
    'logs.showPrevious': 'Afficher le précédent',
    'logs.follow': 'Suivre',
    'logs.refresh': 'Rafraîchir',
    'logs.timestamps': 'Horodatages',
    'logs.wrapLines': 'Wrap Lines',
    'logs.clearLogs': 'Effacer les journaux',
    'logs.logLevel': 'Niveau de journalisation',
    'logs.search': 'Recherche',
    'logs.noMatchingLogs': 'Aucun journal correspondant trouvé',
    'resources.noResourcesFound':
      'Aucun {{resourceType}} trouvé pour cette ressource.',
    'resources.showingLatest':
      'Affichage des derniers {{count}} {{resourceType}}',
    'time.seconds': 'secondes',
    'time.minutes': 'minutes',
    'time.hours': 'heures',
    'time.days': 'jours',
    'events.type': 'Type',
    'events.reason': 'Raison',
    'events.message': 'Message',
    'events.source': 'Source',
    'events.firstSeen': 'Vu pour la première fois',
    'events.lastSeen': 'Vu pour la dernière fois',
    'events.count': 'Nombre',
    'events.noEventsFound': 'Aucun événement trouvé',
    'filters.showLabels': 'Afficher les étiquettes',
    'filters.showPodCount': 'Afficher le nombre de pods',
    'filters.expandApplicationGroups': "Développer les groupes d'applications",
    'filters.showConnectors': 'Afficher les connecteurs',
    'common.status': 'Statut',
    'common.owner': 'Propriétaire',
    'common.location': 'Emplacement',
    'common.viewLogs': 'Afficher les journaux',
    'bootOrder.summary': "Résumé de l'ordre de démarrage",
    'bootOrder.emptySummary': 'Aucun ordre de démarrage configuré',
    'bootOrder.disk': 'Disque',
    'bootOrder.network': 'Réseau',
    'bootOrder.cdrom': 'CD-ROM',
    'vm.status.starting': 'Départ',
    'vm.status.stopping': 'Arrêt',
    'vm.status.stopped': 'Arrêté',
    'vm.status.paused': 'En pause',
    'vm.status.migrating': 'Migration',
    'vm.status.provisioning': 'Provisionnement',
    'vm.status.errorUnschedulable': 'Erreur non programmable',
    'vm.status.errorImagePull': "Extraction d'image d'erreur",
    'vm.status.imageNotReady': 'Image Non Prête',
    'vm.status.waitingForVolumeBinding': 'En attente de liaison de volume',
  },
});

export default topologyTranslationFr;
