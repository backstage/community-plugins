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
    'toolbar.selectCluster': 'Sélectionner un cluster...',
    'toolbar.displayOptions': 'Option d’affichage',
    'toolbar.currentDisplayOptions': "Options d'affichage actuelles",
    'controlBar.zoomIn': 'Zoomer',
    'controlBar.zoomOut': 'Dézoomer',
    'controlBar.fitToScreen': 'Adapter a l’écran',
    'controlBar.resetView': 'Réinitialiser la vue',
    'emptyState.noResourcesFound': 'Aucune ressource trouvée',
    'emptyState.noResourcesDescription':
      "Aucune ressource Kubernetes n'a été trouvée dans le cluster sélectionné.",
    'permissions.missingPermission': 'Autorisation manquante',
    'permissions.missingPermissionDescription':
      'Pour afficher la topologie, votre administrateur doit vous accorder {{permissions}} {{permissionText}}.',
    'permissions.missingPermissionDescription_plural':
      'Pour afficher la topologie, votre administrateur doit vous accorder {{permissions}} {{permissionText}}.',
    'permissions.permission': 'Autorisation',
    'permissions.permissions': 'Autorisations',
    'permissions.goBack': 'Retour',
    'sideBar.details': 'Détails',
    'sideBar.resources': 'Ressources',
    'status.running': 'En cours d’exécution',
    'status.pending': 'En attente',
    'status.succeeded': 'Réussi',
    'status.failed': 'Ayant échoué',
    'status.unknown': 'Inconnu',
    'status.terminating': 'En cours de terminaison',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'Erreur',
    'status.warning': 'Avertissement',
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
    'details.replicas': 'Réplicas',
    'details.availableReplicas': 'Répliques disponibles',
    'details.readyReplicas': "Répliques prêtes à l'emploi",
    'details.updatedReplicas': 'Répliques mises à jour',
    'details.selector': 'Sélecteur',
    'details.strategy': 'Stratégie',
    'details.image': 'Image',
    'details.ports': 'Ports',
    'details.volumes': 'Volumes',
    'details.volumeMounts': 'Supports de volume',
    'details.environmentVariables': 'Variables d’environnement',
    'details.resourceRequirements': 'Besoins en ressources',
    'details.limits': 'Limites',
    'details.requests': 'Demandes',
    'details.cpu': 'Processeur',
    'details.memory': 'Mémoire',
    'details.storage': 'Stockage',
    'details.noLabels': 'Aucune étiquette',
    'details.noAnnotations': 'Aucune annotation',
    'details.noOwner': 'Aucun propriétaire',
    'details.notAvailable': 'Non disponible',
    'details.notConfigured': 'Non configuré',
    'details.updateStrategy': 'Stratégie de mise à jour',
    'details.maxUnavailable': 'Maximum non disponible',
    'details.maxSurge': 'Hausse maximale',
    'details.progressDeadlineSeconds': 'Progression maximale en secondes',
    'details.minReadySeconds': 'Secondes de préparation min.',
    'details.desiredCompletions': 'Achèvements souhaités',
    'details.parallelism': 'Parallélisme',
    'details.activeDeadlineSeconds': 'Délai d’activité en secondes',
    'details.currentCount': 'Nombre actuel',
    'details.desiredCount': 'Nombre souhaité',
    'details.schedule': 'Planifier',
    'details.concurrencyPolicy': 'Stratégie de simultanéité',
    'details.startingDeadlineSeconds': 'Secondes du délai de démarrage',
    'details.lastScheduleTime': 'Heure de la dernière planification',
    'details.maxSurgeDescription': '{{maxSurge}} supérieur à {{replicas}} pod',
    'details.maxUnavailableDescription':
      '{{maxUnavailable}} de {{replicas}} pod',
    'logs.download': 'Télécharger',
    'logs.noLogsFound': 'Aucun journal trouvé',
    'logs.selectContainer': 'Sélectionner le conteneur',
    'logs.container': 'Conteneur',
    'logs.pod': 'Pod',
    'logs.showPrevious': 'Afficher la page précédente',
    'logs.follow': 'Suivre',
    'logs.refresh': 'Actualiser',
    'logs.timestamps': 'Horodatage',
    'logs.wrapLines': 'Retour automatique à la ligne',
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
    'events.reason': 'Motif',
    'events.message': 'Message',
    'events.source': 'Source',
    'events.firstSeen': 'Première apparition',
    'events.lastSeen': 'Dernière connexion',
    'events.count': '({{count}})',
    'events.noEventsFound': 'Aucun événement trouvé',
    'filters.showLabels': 'Afficher les étiquettes',
    'filters.showPodCount': 'Afficher le nombre de capsules',
    'filters.expandApplicationGroups': "Développer les groupes d'applications",
    'filters.showConnectors': 'Afficher les connecteurs',
    'common.status': 'Statut',
    'common.owner': 'Propriétaire',
    'common.location': 'Emplacement',
    'common.viewLogs': 'Afficher les journaux',
    'bootOrder.summary': 'Résumé de la commande de bottes',
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
    'vm.status.errorUnschedulable': 'Erreur non planifiable',
    'vm.status.errorImagePull': 'ErrorImagePull',
    'vm.status.imageNotReady': 'Image non prête',
    'vm.status.waitingForVolumeBinding': 'En attente de la liaison du volume',
  },
});

export default topologyTranslationFr;
