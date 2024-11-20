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
import { V1Pod } from '@kubernetes/client-node';

import { K8sResourceKind, VMIKind, VMKind } from '../types/vm';
import {
  POD_PHASE_PENDING,
  RunStrategy,
  StateChangeRequest,
  VMIPhase,
  VMStatusEnum,
  VMStatusSimpleLabel,
} from '../vm-const';
import {
  getDeletetionTimestamp,
  getPodStatusPhase,
  getStatusConditions,
  getVMIConditionsByType,
} from './selector';

// Paused
const isVMIPaused = (vmi: VMIKind): boolean =>
  getVMIConditionsByType(vmi, 'Paused').length > 0;

// Running
const getStatusPhase = <T = string>(entity: K8sResourceKind): T =>
  entity?.status?.phase;
const isRunning = (vmi: VMIKind): boolean => {
  if (getStatusPhase(vmi) === VMIPhase.Running) {
    return true;
  }
  return false;
};

// Error
const getStatusConditionOfType = (
  statusResource: K8sResourceKind,
  type: string,
) =>
  getStatusConditions(statusResource).find(
    (condition: { type: string }) => condition?.type === type,
  );

const isVMError = (vm: VMKind): boolean => {
  const vmFailureCond = getStatusConditionOfType(vm, 'Failure');
  if (vmFailureCond) {
    return true;
  }

  return false;
};

// Stopped
const isVMCreated = (vm: VMKind) => !!vm?.status?.created;
const isStoppedFromConsole = (vm: VMKind, vmi: VMIKind) => {
  return (
    vm &&
    isVMCreated(vm) &&
    getStatusPhase(vmi) === VMIPhase.Succeeded &&
    vm.status.printableStatus === VMStatusSimpleLabel.Stopped
  );
};

// Deleting
const isDeleting = (vm: VMKind, vmi: VMIKind): boolean =>
  !!(getDeletetionTimestamp(vm) || (vmi && getDeletetionTimestamp(vmi)));

// Stopping
const isVMExpectedRunning = (vm: VMKind, vmi: VMIKind) => {
  if (!vm?.spec) {
    return false;
  }
  const { running, runStrategy } = vm.spec;

  if (running !== null) {
    return running;
  }

  if (runStrategy !== null) {
    let changeRequests;
    switch (runStrategy as RunStrategy) {
      case RunStrategy.Halted:
        return false;
      case RunStrategy.Always:
        return true;
      case RunStrategy.RerunOnFailure:
        return getStatusPhase<VMIPhase>(vmi) !== VMIPhase.Succeeded;
      case RunStrategy.Manual:
      default:
        changeRequests = new Set(
          (vm.status?.stateChangeRequests || []).map(
            chRequest => chRequest?.action,
          ),
        );

        if (changeRequests.has(StateChangeRequest.Stop)) {
          return false;
        }
        if (changeRequests.has(StateChangeRequest.Start)) {
          return true;
        }

        return isVMCreated(vm); // if there is no change request we can assume created is representing running (current and expected)
    }
  }
  return false;
};
const isBeingStopped = (vm: VMKind, vmi: VMIKind): boolean => {
  if (
    vm &&
    !isVMExpectedRunning(vm, vmi) &&
    isVMCreated(vm) &&
    getStatusPhase<VMIPhase>(vmi) !== VMIPhase.Succeeded
  ) {
    return true;
  }

  return false;
};

// Starting
const isStarting = (vm: VMKind, vmi: VMIKind): boolean => {
  if (vm && isVMCreated(vm) && isVMExpectedRunning(vm, vmi)) {
    return true;
  }
  return false;
};

// isInProgress
const isInProgress = (vm: VMKind, vmi: VMIKind) =>
  isStarting(vm, vmi) || isBeingStopped(vm, vmi) || isDeleting(vm, vmi);

// VMI_WAITING (PENDING)
const isVMIWaiting = (vmi: VMIKind) => getStatusPhase(vmi) === VMIPhase.Pending;

// CDI_IMPORT_PENDING(PENDING)
const isCDIImportPending = (pod: V1Pod): boolean =>
  getPodStatusPhase(pod) === POD_PHASE_PENDING;

// V2V_CONVERSION_PENDING(PENDING)
const isV2VConversionPemding = (podOfVM: V1Pod): boolean => {
  const podPhase = getPodStatusPhase(podOfVM);
  return podPhase === POD_PHASE_PENDING;
};
// PENDING
const isPending = (vmi: VMIKind, pod: V1Pod) =>
  isVMIWaiting(vmi) || isCDIImportPending(pod) || isV2VConversionPemding(pod);

export const getStatus = (vm: VMKind, vmi: VMIKind, pod: V1Pod) => {
  if (isVMIPaused(vmi)) {
    return VMStatusEnum.PAUSED;
  } else if (isRunning(vmi)) {
    return VMStatusEnum.RUNNING;
  } else if (isVMError(vm)) {
    return VMStatusEnum.ERROR;
  } else if (isStoppedFromConsole(vm, vmi)) {
    return VMStatusEnum.STOPPED;
  } else if (isInProgress(vm, vmi)) {
    return VMStatusEnum.IN_PROGRESS;
  } else if (isPending(vmi, pod)) {
    return VMStatusEnum.PENDING;
  }
  return VMStatusEnum.UNKNOWN;
};
