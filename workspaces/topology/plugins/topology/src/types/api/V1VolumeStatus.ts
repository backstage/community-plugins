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
import { V1HotplugVolumeStatus } from './V1HotplugVolumeStatus';

// VolumeStatus represents information about the status of volumes attached to the VirtualMachineInstance.
export interface V1VolumeStatus {
  // If the volume is hotplug, this will contain the hotplug status.
  hotplugVolume?: V1HotplugVolumeStatus;
  // Message is a detailed message about the current hotplug volume phase.
  message?: string;
  // Name is the name of the volume - Required.
  name: string;
  // phase of volume.
  phase?: string;
  // Reason is a brief description of why we are in the current hotplug volume phase
  reason?: string;
  // Target is the target name used when adding the volume to the VM, eg: vda - Required.
  target: string;
}
