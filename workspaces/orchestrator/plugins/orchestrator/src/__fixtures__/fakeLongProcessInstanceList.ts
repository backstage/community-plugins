import {
  ProcessInstance,
  ProcessInstanceState,
  WorkflowCategory,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { fakeWorkflowOverviewList } from './fakeWorkflowOverviewList';

const createValuesGenerator = (counter: number, size: number) => {
  const baseDate = new Date('2024-02-01');
  const DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const startDate = new Date(baseDate.getTime() - 30 * DAY); // 30 days ago
  const endDate = new Date();

  const getNextEnumValue = (enumerator: object) => {
    const values = Object.values(enumerator);
    const index = counter % values.length;
    return values[index];
  };

  const getNextDate = (): Date => {
    const startMillis = startDate.getTime();
    const endMillis = endDate.getTime();
    const millis =
      startMillis + ((endMillis - startMillis) / size) * (counter % size); // Assuming 5 states
    return new Date(millis);
  };

  return {
    getNextEnumValue,
    getNextDate,
  };
};

export const generateFakeProcessInstances = (
  listSize: number,
): ProcessInstance[] => {
  const instances: ProcessInstance[] = [];

  for (let i = 0; i < listSize; i++) {
    const valuesGenerator = createValuesGenerator(i, listSize);

    const randomState = valuesGenerator.getNextEnumValue(ProcessInstanceState);
    const randomCategory = valuesGenerator.getNextEnumValue(WorkflowCategory);

    instances.push({
      id: `12f767c1-9002-43af-9515-62a72d0eaf${i}`,
      processId:
        fakeWorkflowOverviewList[i % fakeWorkflowOverviewList.length]
          .workflowId,
      state: randomState,
      endpoint: 'enpoint/foo',
      start: valuesGenerator.getNextDate().toISOString(),
      nodes: [],
      variables: {},
      isOpen: false,
      isSelected: false,
      category: randomCategory,
      description: `test description ${i}`,
    });
  }

  return instances;
};
