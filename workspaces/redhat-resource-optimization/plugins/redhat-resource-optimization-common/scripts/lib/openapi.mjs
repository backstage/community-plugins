import { writeFileSync } from 'node:fs';
import { fetchJson } from './fetch.mjs';
import { toYaml } from './yaml.mjs';

function patchTitle(spec) {
  spec.info.title = 'redhat-resource-optimization';
  return spec;
}

function patchComponentSchemaPlotDetails(spec) {
  const plotDetailsDef = spec.components.schemas.PlotDetails;
  delete plotDetailsDef.properties;
  plotDetailsDef.additionalProperties = {
    type: 'object',
    properties: {
      cpuUsage: {
        $ref: '#/components/schemas/cpuUsage',
      },
      memoryUsage: {
        $ref: '#/components/schemas/memoryUsage',
      },
    },
  };

  return spec;
}

function patchPathRecommendationsList(spec) {
  const RECOMMENDATIONS_LIST_PATH = '/recommendations/openshift';
  const recommendationsListDef = spec.paths[RECOMMENDATIONS_LIST_PATH];

  // We delete the tags to prevent the generator from making a module
  // named apis/OrchestratorApi.client.ts that doesn't get exposed
  // properly by the generator.
  delete recommendationsListDef.get.tags;

  // Patch the order_how and order_by parameters to generate enums
  const { parameters = [] } = recommendationsListDef.get;
  for (const parameter of parameters) {
    if (parameter.name === 'order_how') {
      parameter.schema.enum = ['asc', 'desc'];
    }

    if (parameter.name === 'order_by') {
      parameter.schema.enum = [
        'cluster',
        'project',
        'workload_type',
        'workload',
        'container',
        'last_reported',
      ];
    }
  }

  // The following parameters should have been defined as Array<string>
  const PROBLEMATIC_QUERY_PARAM_NAMES =
    /(cluster|workload_type|workload|container|project)/;
  const problematicParams = parameters.filter(p =>
    PROBLEMATIC_QUERY_PARAM_NAMES.test(p.name),
  );
  for (const parameter of problematicParams) {
    if (parameter.schema.type === 'string') {
      parameter.schema = {
        type: 'array',
        items: {
          type: 'string',
        },
      };
    }
  }

  return spec;
}

/**
 * The `getRecommendationsById` operation accepts a path parameter called 'recommendation-id'
 * that the code generator fails to transform into a valid JavaScript identifier due to the
 * usage of a dash (`-`) as the word separator character.
 * This patch converts the `-` into a `_` by mutating the input JSON OpenAPI spec.
 */
function patchPathRecommendationsById(spec) {
  const RECOMMENDATION_BY_ID_PATH =
    '/recommendations/openshift/{recommendation-id}';
  const recommendationsByIdDef = structuredClone(
    spec.paths[RECOMMENDATION_BY_ID_PATH],
  );

  // We delete the tags to prevent the generator from making a module
  // named apis/OrchestratorApi.client.ts that doesn't get exposed
  // properly by the generator.
  delete recommendationsByIdDef.get.tags;

  const { parameters = [] } = recommendationsByIdDef.get;
  for (const parameter of parameters) {
    parameter.name = parameter.name.replace('-', '_');
  }

  spec.paths[RECOMMENDATION_BY_ID_PATH.replace('-', '_')] =
    recommendationsByIdDef;
  delete spec.paths[RECOMMENDATION_BY_ID_PATH];

  return spec;
}

export async function updateSchema(url, saveLocation) {
  const spec = await fetchJson(url);

  patchTitle(spec);
  patchPathRecommendationsList(spec);
  patchPathRecommendationsById(spec);
  patchComponentSchemaPlotDetails(spec);

  const encoder = new TextEncoder();
  const data = encoder.encode(toYaml(spec));
  writeFileSync(saveLocation, data);
}
