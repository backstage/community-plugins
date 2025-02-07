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
const DEFAULT_NODE_PAD = 20;
const DEFAULT_GROUP_PAD = 40;

export const NODE_WIDTH = 104;
export const NODE_HEIGHT = 104;
export const NODE_PADDING = [0, DEFAULT_NODE_PAD];

export const GROUP_WIDTH = 300;
export const GROUP_HEIGHT = 180;
export const GROUP_PADDING = [
  DEFAULT_GROUP_PAD,
  DEFAULT_GROUP_PAD,
  DEFAULT_GROUP_PAD + 20,
  DEFAULT_GROUP_PAD,
];

export const MAXSHOWRESCOUNT = 3;

export const RESOURCE_NAME_TRUNCATE_LENGTH = 13;

export const TYPE_WORKLOAD = 'workload';
export const TYPE_VM = 'virtualmachine';
export const TYPE_APPLICATION_GROUP = 'part-of';
export const TYPE_CONNECTS_TO = 'connects-to';
export const INSTANCE_LABEL = 'app.kubernetes.io/instance';

export const MEMO: { [key: string]: any } = {};

export const SHOW_POD_COUNT_FILTER_ID = 'show-pod-count';

export const TOPOLOGY_FILTERS = [
  {
    value: SHOW_POD_COUNT_FILTER_ID,
    content: 'Pod count',
    isSelected: false,
    isDisabled: false,
  },
];

export const LABEL_USED_TEMPLATE_NAME = 'vm.kubevirt.io/template';
export const TEMPLATE_OS_LABEL = 'os.template.kubevirt.io';
export const TEMPLATE_OS_NAME_ANNOTATION = 'name.os.template.kubevirt.io';
export const TEMPLATE_WORKLOAD_LABEL = 'workload.template.kubevirt.io';
