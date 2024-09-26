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

import { merge, isErrorResult, MergeInput } from 'openapi-merge';
import { Swagger } from 'atlassian-openapi';
import Swagger2OpenAPI from 'swagger2openapi';
// @ts-ignore
import SwaggerConverter from 'swagger-converter';
import { NonEmptyArray } from './types';

export function isSwagger1_2(apiDoc: any): boolean {
  return apiDoc.swaggerVersion && apiDoc.swaggerVersion === '1.2';
}

export function isSwagger2_0(apiDoc: any): boolean {
  return apiDoc.swagger && apiDoc.swagger === '2.0';
}

export function isOpenAPI3_0(apiDoc: any): boolean {
  return apiDoc.openapi;
}

export class OpenAPIMergerAndConverter {
  async mergeOpenAPI3Docs(
    docs: NonEmptyArray<Swagger.SwaggerV3>,
  ): Promise<Swagger.SwaggerV3> {
    const mergeInput: MergeInput = docs.map(doc => {
      return { oas: doc };
    });

    const result = await merge(mergeInput);
    if (isErrorResult(result)) {
      throw new Error(result.message);
    }
    return result.output;
  }

  // Convert api doc to format openAPI 3. Do nothing with doc if it has format openAPI 3.0.
  // 3scale supports API docs in formats:
  // - swagger 1.2
  // - swagger 2.0
  // - openAPI 3.0
  async convertAPIDocToOpenAPI3(apiDoc: any): Promise<Swagger.SwaggerV3> {
    if (isOpenAPI3_0(apiDoc)) {
      return apiDoc;
    }
    if (isSwagger1_2(apiDoc)) {
      // Unfortunately there is no library in the JavaScript world, which can convert both swagger 1.2 and 2.0 to openAPI 3.0.
      // That's why, for swagger 1.2 we are using convertation to swagger 2.0. And then swagger 2.0 will be converted to openAPI 3.0.
      const swagger2_0Doc = await this.convertSwagger1_2To2_0(apiDoc);
      return await this.convertSwagger2_0ToOpenAPI3_0(swagger2_0Doc);
    }
    if (isSwagger2_0(apiDoc)) {
      return await this.convertSwagger2_0ToOpenAPI3_0(apiDoc);
    }

    throw new Error(
      `Unsupported API document. Plugin supports Swagger 1.2, 2.0, 3.0(Open API 3.0)`,
    );
  }

  async convertSwagger1_2To2_0(swaggerDoc: any): Promise<any> {
    try {
      const result = SwaggerConverter.convert(swaggerDoc, {});
      return result;
    } catch (error) {
      console.error('Error converting Swagger 1.2 to Swagger 2.0:', error);
      throw error;
    }
  }

  private async convertSwagger2_0ToOpenAPI3_0(swaggerDoc: any): Promise<any> {
    try {
      const result = await Swagger2OpenAPI.convertObj(swaggerDoc, {
        patch: true, // patch: true  helps to fix minor issues
        warnOnly: true, // Do not throw on non-patchable errors
      });
      return result.openapi;
    } catch (error) {
      console.error('Error converting Swagger 2.0 to OpenAPI 3.0:', error);
      throw error;
    }
  }
}
