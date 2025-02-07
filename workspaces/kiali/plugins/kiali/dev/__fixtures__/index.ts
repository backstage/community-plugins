/*
 * Copyright 2024 The Backstage Authors
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

import anonymousAuth from './general/auth_info_anonymous.json';
import configData from './general/config.json';
/** Metrics **/
import crippledFeatures from './general/crippledFeatures.json';
import grafanaInfo from './general/grafana.json';
import bookinfoGraph from './general/graph.json';
import istioCertsInfo from './general/istioCertsInfo.json';
import istioConfig from './general/istioConfig.json';
import istioContainerLogs from './general/istioLogs.json';
import istioStatus from './general/istioStatus.json';
import istioValidations from './general/istioValidations.json';
import containerLogs from './general/logs.json';
import spanLogs from './general/logSpan.json';
import meshCanaryStatus from './general/meshCanaryStatus.json';
import meshIstioResourceThresholds from './general/meshIstioResurceThresholds.json';
import meshTls from './general/meshTls.json';
import namespacesData from './general/namespaces.json';
import outboundTrafficPolicy from './general/outbound_traffic_policy_mode.json';
import status from './general/status.json';
import bookinfoApps from './namespaces/bookinfo/apps.json';
import detailsApp from './namespaces/bookinfo/apps/details.json';
import kialiTrafficGeneratorApp from './namespaces/bookinfo/apps/kiali_traffic_generator.json';
import productpageApp from './namespaces/bookinfo/apps/productpage.json';
import ratingsApp from './namespaces/bookinfo/apps/ratings.json';
import reviewsApp from './namespaces/bookinfo/apps/reviews.json';
import bookinfoDashboard from './namespaces/bookinfo/dashboard.json';
/** health **/

import bookinfoHealthApp from './namespaces/bookinfo/health/app.json';
import bookinfoHealthService from './namespaces/bookinfo/health/service.json';
import bookinfoHealthWorkload from './namespaces/bookinfo/health/workload.json';
import bookinfoIstioConfig from './namespaces/bookinfo/istio_config.json';
import bookinfoGateway from './namespaces/bookinfo/istio_configs/gateways/bookinfo-gateway.json';
import bookinfoVirtualService from './namespaces/bookinfo/istio_configs/virtualservices/bookinfo.json';
import bookInfoMetrics from './namespaces/bookinfo/metrics';
import bookinfoServices from './namespaces/bookinfo/services.json';
import detailsService from './namespaces/bookinfo/services/details.json';
import productpageService from './namespaces/bookinfo/services/productpage.json';
import ratingsService from './namespaces/bookinfo/services/ratings.json';
import reviewsService from './namespaces/bookinfo/services/reviews.json';
import bookinfoSpans from './namespaces/bookinfo/spans.json';
/* bookinfo */
import bookinfoTls from './namespaces/bookinfo/tls.json';
/** Workloads **/
import bookinfoWorkloads from './namespaces/bookinfo/workloads.json';
import detailsWorkload from './namespaces/bookinfo/workloads/details_v1.json';
import kialitrafficWorkload from './namespaces/bookinfo/workloads/kiali_traffic_generator.json';
import productpagev1Workload from './namespaces/bookinfo/workloads/productpage_v1.json';
import ratingsv1Workload from './namespaces/bookinfo/workloads/ratings_v1.json';
import reviewsv1Workload from './namespaces/bookinfo/workloads/reviews_v1.json';
import reviewsv2Workload from './namespaces/bookinfo/workloads/reviews_v2.json';
import reviewsv3Workload from './namespaces/bookinfo/workloads/reviews_v3.json';
import istioSystemApps from './namespaces/istio-system/apps.json';
import istioegressgatewayApp from './namespaces/istio-system/apps/istio_egressgateway.json';
import istioingressgatewayApp from './namespaces/istio-system/apps/istio_ingressgateway.json';
import istiodApp from './namespaces/istio-system/apps/istiod.json';
import jaegerApp from './namespaces/istio-system/apps/jaeger.json';
import kialiApp from './namespaces/istio-system/apps/kiali.json';
import istioDashboard from './namespaces/istio-system/dashboard.json';
/**   health  **/
import istioSystemHealthApp from './namespaces/istio-system/health/app.json';
import istioSystemHealthService from './namespaces/istio-system/health/service.json';
import istioSystemHealthWorkload from './namespaces/istio-system/health/workload.json';
import istioSystemIstioConfig from './namespaces/istio-system/istio_config.json';
import istioSystemMetrics from './namespaces/istio-system/metrics';
import istioSystemServices from './namespaces/istio-system/services.json';
import grafanaService from './namespaces/istio-system/services/grafana.json';
import istioegressgatewayService from './namespaces/istio-system/services/istio_egressgateway.json';
import istioingressgatewayService from './namespaces/istio-system/services/istio_ingressgateway.json';
import istiodService from './namespaces/istio-system/services/istiod.json';
import jaegerService from './namespaces/istio-system/services/jaeger_collector.json';
import kialiService from './namespaces/istio-system/services/kiali.json';
import prometheusService from './namespaces/istio-system/services/prometheus.json';
import istioSpans from './namespaces/istio-system/spans.json';
/* istio-system */
import istioSystemTls from './namespaces/istio-system/tls.json';
import istioSystemWorkloads from './namespaces/istio-system/workloads.json';
import grafanaWorkload from './namespaces/istio-system/workloads/grafana.json';
import istioegressgatewayWorkload from './namespaces/istio-system/workloads/istio_egressgateway.json';
import istioingressgatewayWorkload from './namespaces/istio-system/workloads/istio_ingressgateway.json';
import istiodWorkload from './namespaces/istio-system/workloads/istiod.json';
import jaegerWorkload from './namespaces/istio-system/workloads/jaeger.json';
import kialiWorkload from './namespaces/istio-system/workloads/kiali.json';
import prometheusWorkload from './namespaces/istio-system/workloads/prometheus.json';
import travelAgencyApps from './namespaces/travel-agency/apps.json';
import carsApp from './namespaces/travel-agency/apps/cars.json';
import discountsApp from './namespaces/travel-agency/apps/discounts.json';
import flightsApp from './namespaces/travel-agency/apps/flights.json';
import hotelsApp from './namespaces/travel-agency/apps/hotels.json';
import insurancesApp from './namespaces/travel-agency/apps/insurances.json';
import mysqldbApp from './namespaces/travel-agency/apps/mysqldb.json';
import travelApp from './namespaces/travel-agency/apps/travels.json';
import travelAgencyDashboard from './namespaces/travel-agency/dashboard.json';
/** health **/

import travelAgencyHealthApp from './namespaces/travel-agency/health/app.json';
import travelAgencyHealthService from './namespaces/travel-agency/health/service.json';
import travelAgencyHealthWorkload from './namespaces/travel-agency/health/workload.json';
import travelAgencyIstioConfig from './namespaces/travel-agency/istio_config.json';
import travelAgencyMetrics from './namespaces/travel-agency/metrics';
import travelAgencyServices from './namespaces/travel-agency/services.json';
import carsService from './namespaces/travel-agency/services/cars.json';
import discountsService from './namespaces/travel-agency/services/discounts.json';
import flightsService from './namespaces/travel-agency/services/flights.json';
import hotelsService from './namespaces/travel-agency/services/hotels.json';
import insurancesService from './namespaces/travel-agency/services/insurances.json';
import mysqldbService from './namespaces/travel-agency/services/mysqldb.json';
import travelService from './namespaces/travel-agency/services/travels.json';
import travelAgencySpans from './namespaces/travel-agency/spans.json';
/* Travel agency */
import travelAgencyTls from './namespaces/travel-agency/tls.json';
import travelAgencyWorkloads from './namespaces/travel-agency/workloads.json';
import carsv1Workload from './namespaces/travel-agency/workloads/cars_v1.json';
import discountsv1Workload from './namespaces/travel-agency/workloads/discounts_v1.json';
import flightsv1Workload from './namespaces/travel-agency/workloads/flights_v1.json';
import hotelsv1Workload from './namespaces/travel-agency/workloads/hotels_v1.json';
import insurancesv1Workload from './namespaces/travel-agency/workloads/insurances_v1.json';
import mysqldbv1Workload from './namespaces/travel-agency/workloads/mysqldb_v1.json';
import travelsv1Workload from './namespaces/travel-agency/workloads/travels_v1.json';
import travelControlApps from './namespaces/travel-control/apps.json';
import controlApp from './namespaces/travel-control/apps/control.json';
import travelControlDashboard from './namespaces/travel-control/dashboard.json';
/** health **/

import travelControlHealthApp from './namespaces/travel-control/health/app.json';
import travelControlHealthService from './namespaces/travel-control/health/service.json';
import travelControlHealthWorkload from './namespaces/travel-control/health/workload.json';
import travelControlIstioConfig from './namespaces/travel-control/istio_config.json';
import controlDR from './namespaces/travel-control/istio_configs/destinationrules/control.json';
import controlGW from './namespaces/travel-control/istio_configs/gateways/control-gateway.json';
import controlVR from './namespaces/travel-control/istio_configs/virtualservices/control.json';
import travelControlMetrics from './namespaces/travel-control/metrics';
import travelControlServices from './namespaces/travel-control/services.json';
import controlService from './namespaces/travel-control/services/control.json';
import travelControlSpans from './namespaces/travel-control/spans.json';
/* Travel control */
import travelControlTls from './namespaces/travel-control/tls.json';
import travelControlWorkloads from './namespaces/travel-control/workloads.json';
import travelControlWorkload from './namespaces/travel-control/workloads/control.json';
import travelsApp from './namespaces/travel-portal/apps/travels.json';
import viaggiApp from './namespaces/travel-portal/apps/viaggi.json';
import voyagesApp from './namespaces/travel-portal/apps/voyages.json';
import travelPortalDashboard from './namespaces/travel-portal/dashboard.json';
/** health **/

import travelPortalHealthApp from './namespaces/travel-portal/health/app.json';
import travelPortalHealthService from './namespaces/travel-portal/health/service.json';
import travelPortalHealthWorkload from './namespaces/travel-portal/health/workload.json';
import travelPortalIstioConfig from './namespaces/travel-portal/istio_config.json';
import travelPortalMetrics from './namespaces/travel-portal/metrics';
import travelPortalServices from './namespaces/travel-portal/services.json';
import travelsService from './namespaces/travel-portal/services/travels.json';
import viaggiService from './namespaces/travel-portal/services/viaggi.json';
import voyagesService from './namespaces/travel-portal/services/voyages.json';
import travelPortalSpans from './namespaces/travel-portal/spans.json';
/* Travel portal */
import travelPortalTls from './namespaces/travel-portal/tls.json';
import travelPortalWorkloads from './namespaces/travel-portal/workloads.json';
import travelPortalApps from './namespaces/travel-portal/workloads.json';
import travelPortalTravels from './namespaces/travel-portal/workloads/travels.json';
import travelPortalViaggi from './namespaces/travel-portal/workloads/viaggi.json';
import travelPortalVoyages from './namespaces/travel-portal/workloads/voyages.json';

export const kialiData: { [index: string]: any } = {
  auth: anonymousAuth,
  config: configData,
  namespaces: namespacesData,
  meshTls: meshTls,
  meshCanaryStatus: meshCanaryStatus,
  meshIstioResourceThresholds: meshIstioResourceThresholds,
  outboundTrafficPolicy: outboundTrafficPolicy,
  istioValidations: istioValidations,
  istioConfig: istioConfig,
  istioStatus: istioStatus,
  istioCertsInfo: istioCertsInfo,
  graph: bookinfoGraph,
  namespacesData: {
    'istio-system': {
      tls: istioSystemTls,
      metrics: istioSystemMetrics,
      health: {
        app: istioSystemHealthApp,
        service: istioSystemHealthService,
        workload: istioSystemHealthWorkload,
      },
      workloads: {
        grafana: grafanaWorkload,
        istioegressgateway: istioegressgatewayWorkload,
        istioingressgateway: istioingressgatewayWorkload,
        istiod: istiodWorkload,
        jaeger: jaegerWorkload,
        kiali: kialiWorkload,
        prometheus: prometheusWorkload,
      },
      services: {
        grafana: grafanaService,
        istioegressgateway: istioegressgatewayService,
        istioingressgateway: istioingressgatewayService,
        istiod: istiodService,
        jaeger: jaegerService,
        kiali: kialiService,
        prometheus: prometheusService,
      },
      apps: {
        istioegressgateway: istioegressgatewayApp,
        istioingressgateway: istioingressgatewayApp,
        istiod: istiodApp,
        jaeger: jaegerApp,
        kiali: kialiApp,
      },
      istioConfigList: istioSystemIstioConfig,
      dashboard: istioDashboard,
      spans: istioSpans,
    },
    bookinfo: {
      tls: bookinfoTls,
      metrics: bookInfoMetrics,
      health: {
        app: bookinfoHealthApp,
        service: bookinfoHealthService,
        workload: bookinfoHealthWorkload,
      },
      workloads: {
        detailsv1: detailsWorkload,
        kialitrafficgenerator: kialitrafficWorkload,
        productpagev1: productpagev1Workload,
        ratingsv1: ratingsv1Workload,
        reviewsv1: reviewsv1Workload,
        reviewsv2: reviewsv2Workload,
        reviewsv3: reviewsv3Workload,
      },
      services: {
        details: detailsService,
        productpage: productpageService,
        ratings: ratingsService,
        reviews: reviewsService,
      },
      apps: {
        details: detailsApp,
        productpage: productpageApp,
        ratings: ratingsApp,
        reviews: reviewsApp,
        kialitrafficgenerator: kialiTrafficGeneratorApp,
      },
      istioConfigDetails: {
        gateways: {
          'bookinfo-gateway': bookinfoGateway,
        },
        virtualservices: {
          bookinfo: bookinfoVirtualService,
        },
      },
      istioConfigList: bookinfoIstioConfig,
      dashboard: bookinfoDashboard,
      spans: bookinfoSpans,
    },
    'travel-control': {
      tls: travelControlTls,
      metrics: travelControlMetrics,
      health: {
        app: travelControlHealthApp,
        service: travelControlHealthService,
        workload: travelControlHealthWorkload,
      },
      workloads: {
        control: travelControlWorkload,
      },
      services: {
        control: controlService,
      },
      apps: {
        control: controlApp,
      },
      istioConfigDetails: {
        destinationrules: {
          control: controlDR,
        },
        virtualservices: {
          control: controlVR,
        },
        gateways: {
          'control-gateway': controlGW,
        },
      },
      istioConfigList: travelControlIstioConfig,
      dashboard: travelControlDashboard,
      spans: travelControlSpans,
    },
    'travel-portal': {
      tls: travelPortalTls,
      metrics: travelPortalMetrics,
      health: {
        app: travelPortalHealthApp,
        service: travelPortalHealthService,
        workload: travelPortalHealthWorkload,
      },
      workloads: {
        travels: travelPortalTravels,
        viaggi: travelPortalViaggi,
        voyages: travelPortalVoyages,
      },
      services: {
        travels: travelsService,
        viaggi: viaggiService,
        voyages: voyagesService,
      },
      apps: {
        travels: travelsApp,
        viaggi: viaggiApp,
        voyages: voyagesApp,
      },
      istioConfigList: travelPortalIstioConfig,
      dashboard: travelPortalDashboard,
      spans: travelPortalSpans,
    },
    'travel-agency': {
      tls: travelAgencyTls,
      metrics: travelAgencyMetrics,
      health: {
        app: travelAgencyHealthApp,
        service: travelAgencyHealthService,
        workload: travelAgencyHealthWorkload,
      },
      workloads: {
        carsv1: carsv1Workload,
        discountsv1: discountsv1Workload,
        flightsv1: flightsv1Workload,
        hotelsv1: hotelsv1Workload,
        insurancesv1: insurancesv1Workload,
        mysqldbv1: mysqldbv1Workload,
        travels: travelsv1Workload,
      },
      services: {
        cars: carsService,
        discounts: discountsService,
        flights: flightsService,
        hotels: hotelsService,
        insurances: insurancesService,
        mysqldb: mysqldbService,
        travels: travelService,
      },
      apps: {
        cars: carsApp,
        discounts: discountsApp,
        flights: flightsApp,
        hotels: hotelsApp,
        insurances: insurancesApp,
        mysqldb: mysqldbApp,
        travels: travelApp,
      },
      istioConfigList: travelAgencyIstioConfig,
      dashboard: travelAgencyDashboard,
      spans: travelAgencySpans,
    },
  },
  logs: containerLogs,
  istioLogs: istioContainerLogs,
  spanLogs: spanLogs,
  workloads: {
    'istio-system': istioSystemWorkloads,
    bookinfo: bookinfoWorkloads,
    'travel-portal': travelPortalWorkloads,
    'travel-agency': travelAgencyWorkloads,
    'travel-control': travelControlWorkloads,
  },
  services: {
    'istio-system': istioSystemServices,
    bookinfo: bookinfoServices,
    'travel-portal': travelPortalServices,
    'travel-agency': travelAgencyServices,
    'travel-control': travelControlServices,
  },
  apps: {
    'istio-system': istioSystemApps,
    bookinfo: bookinfoApps,
    'travel-portal': travelPortalApps,
    'travel-agency': travelAgencyApps,
    'travel-control': travelControlApps,
  },
  status: status,
  crippledFeatures: crippledFeatures,
  grafanaInfo: grafanaInfo,
};
