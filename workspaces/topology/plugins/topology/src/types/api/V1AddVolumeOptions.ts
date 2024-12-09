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
import { V1Disk } from './V1Disk';
import { V1HotplugVolumeSource } from './V1HotplugVolumeSource';

// AddVolumeOptions is provided when dynamically hot plugging a volume and disk
export interface V1AddVolumeOptions {
  // Disk represents the hotplug disk that will be plugged into the running VMI.
  disk: V1Disk;
  // Name represents the name that will be used to map the disk to the corresponding volume. This overrides any name set inside the Disk struct itself.
  name: string;
  // VolumeSource represents the source of the volume to map to the disk.
  volumeSource: V1HotplugVolumeSource;
}
