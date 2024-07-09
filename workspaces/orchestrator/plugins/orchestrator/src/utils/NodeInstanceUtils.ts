import moment from 'moment';

import { NodeInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { isNonNullable } from './TypeGuards';

export const compareNodes = (nodeA: NodeInstance, nodeB: NodeInstance) => {
  const aEnter = moment(nodeA.enter);
  const bEnter = moment(nodeB.enter);
  if (aEnter.isBefore(bEnter)) {
    return -1;
  } else if (aEnter.isAfter(bEnter)) {
    return 1;
  }

  if (isNonNullable(nodeA.exit) && isNonNullable(nodeB.exit)) {
    const aExit = moment(nodeA.exit);
    const bExit = moment(nodeB.exit);
    if (aExit.isBefore(bExit)) {
      return -1;
    } else if (aExit.isAfter(bExit)) {
      return 1;
    }
  } else {
    // nodeA exited, but nodeB didn't
    if (isNonNullable(nodeA.exit)) return -1;
    // nodeB exited, but nodeA didn't
    if (isNonNullable(nodeB.exit)) return 1;
  }

  if (nodeA.id < nodeB.id) {
    return -1;
  } else if (nodeA.id > nodeB.id) {
    return 1;
  }

  return 0;
};
