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
import { type ConfigApi } from '@backstage/core-plugin-api';

import { MockArgs } from './types';

export class ConfigApiMock implements ConfigApi {
  public subscribe;
  public has;
  public keys;
  public get;
  public getOptional;
  public getConfig;
  public getOptionalConfig;
  public getConfigArray;
  public getOptionalConfigArray;
  public getNumber;
  public getOptionalNumber;
  public getBoolean;
  public getOptionalBoolean;
  public getString;
  public getOptionalString;
  public getStringArray;
  public getOptionalStringArray;

  public constructor(args?: MockArgs<ConfigApi>) {
    this.subscribe = jest.fn();
    this.has = jest.fn();
    this.keys = jest.fn();
    this.get = jest.fn();
    this.getOptional = jest.fn();
    this.getConfig = jest.fn();
    this.getOptionalConfig = jest.fn();
    this.getConfigArray = jest.fn();
    this.getOptionalConfigArray = jest.fn();
    this.getNumber = jest.fn();
    this.getOptionalNumber = jest.fn();
    this.getBoolean = jest.fn();
    this.getOptionalBoolean = jest.fn();
    this.getString = jest.fn();
    this.getOptionalString = jest.fn();
    this.getStringArray = jest.fn();
    this.getOptionalStringArray = jest.fn();

    (
      Object.entries(args ?? {}) as [
        keyof MockArgs<ConfigApi>,
        MockArgs<ConfigApi>[keyof MockArgs<ConfigApi>],
      ][]
    ).forEach(([key, value]) => {
      if (value) {
        this[key] = value;
      }
    });
  }
}
