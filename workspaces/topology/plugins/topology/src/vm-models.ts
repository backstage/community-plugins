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
import { GroupVersionKind, Model } from './types/types';

export const VirtualMachineGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  kind: 'VirtualMachine',
};

export const VirtualMachineInstanceGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  kind: 'VirtualMachineInstance',
};

export const VirtualMachineModel: Model = {
  ...VirtualMachineGVK,
  abbr: 'VM',
  labelPlural: 'VirtualMachines',
  color: '#2b9af3',
  plural: 'virtualmachines',
};

export const VirtualMachineInstanceModel: Model = {
  ...VirtualMachineInstanceGVK,
  abbr: 'VMI',
  labelPlural: 'VirtualMachineInstances',
  color: '#2b9af3',
  plural: 'virtualmachineinstances',
};
