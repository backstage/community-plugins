import { NodeInstanceDTO } from '@backstage-community/plugin-orchestrator-common';

import { compareNodes } from './NodeInstanceUtils';

const newMockNodeInstance = (
  enter: NodeInstanceDTO['enter'] = new Date().toString(),
  exit?: NodeInstanceDTO['exit'],
  id: NodeInstanceDTO['id'] = '1',
): NodeInstanceDTO => {
  const subject: NodeInstanceDTO = {
    id,
    name: 'N/A',
    type: 'N/A',
    nodeId: 'N/A',
    definitionId: 'N/A',
    enter,
  };

  if (exit) {
    subject.exit = exit;
  }

  return subject;
};

describe('NodeInstanceUtils.ts', () => {
  describe('compareNodes', () => {
    describe('A starts before B', () => {
      it('should return -1', () => {
        // arrange
        const now = Date.now();
        const nodeA: NodeInstanceDTO = newMockNodeInstance(
          new Date(now).toISOString(),
        );
        const nodeB: NodeInstanceDTO = newMockNodeInstance(
          new Date(now + 1).toISOString(),
        );

        // act
        const result = compareNodes(nodeA, nodeB);

        // assert
        expect(result).toEqual(-1);
      });
    });
    describe('B starts before A', () => {
      it('should return 1', () => {
        // arrange
        const now = Date.now();
        const nodeB: NodeInstanceDTO = newMockNodeInstance(
          new Date(now).toISOString(),
        );
        const nodeA: NodeInstanceDTO = newMockNodeInstance(
          new Date(now + 1).toISOString(),
        );

        // act
        const result = compareNodes(nodeA, nodeB);

        // assert
        expect(result).toEqual(1);
      });
    });
    describe('A and B start at the same time', () => {
      describe('A and B finished', () => {
        describe('A finished before B', () => {
          it('should return -1', () => {
            // arrange
            const now = Date.now();
            const nodeA: NodeInstanceDTO = newMockNodeInstance(
              new Date(now).toISOString(),
              new Date(now + 1).toISOString(),
            );
            const nodeB: NodeInstanceDTO = newMockNodeInstance(
              new Date(now).toISOString(),
              new Date(now + 2).toISOString(),
            );

            // act
            const result = compareNodes(nodeA, nodeB);

            // assert
            expect(result).toEqual(-1);
          });
        });
        describe('B finished before A', () => {
          it('should return 1', () => {
            // arrange
            const now = Date.now();
            const nodeB: NodeInstanceDTO = newMockNodeInstance(
              new Date(now).toISOString(),
              new Date(now + 1).toISOString(),
            );
            const nodeA: NodeInstanceDTO = newMockNodeInstance(
              new Date(now).toISOString(),
              new Date(now + 2).toISOString(),
            );

            // act
            const result = compareNodes(nodeA, nodeB);

            // assert
            expect(result).toEqual(1);
          });
        });
      });
      describe('A finishes but B remains active', () => {
        it('should return -1', () => {
          // arrange
          const now = Date.now();
          const nodeA: NodeInstanceDTO = newMockNodeInstance(
            new Date(now).toString(),
            new Date(now + 1).toString(),
          );
          const nodeB: NodeInstanceDTO = newMockNodeInstance(
            new Date(now).toISOString(),
          );

          // act
          const result = compareNodes(nodeA, nodeB);

          // assert
          expect(result).toEqual(-1);
        });
      });
      describe('B finishes but A remains active', () => {
        it('should return 1', () => {
          // arrange
          const now = Date.now();
          const nodeB: NodeInstanceDTO = newMockNodeInstance(
            new Date(now).toISOString(),
            new Date(now + 1).toISOString(),
          );
          const nodeA: NodeInstanceDTO = newMockNodeInstance(
            new Date(now).toISOString(),
          );

          // act
          const result = compareNodes(nodeA, nodeB);

          // assert
          expect(result).toEqual(1);
        });
      });
    });
    describe('A and B finish at the same time', () => {
      describe('A.id is before B.id lexicographically', () => {
        it('should return -1', () => {
          // arrange
          const now = Date.now();
          const end = Date.now() + 1;
          const nodeA: NodeInstanceDTO = newMockNodeInstance(
            new Date(now).toISOString(),
            new Date(end).toISOString(),
            'a',
          );
          const nodeB: NodeInstanceDTO = newMockNodeInstance(
            new Date(now).toISOString(),
            new Date(end).toISOString(),
            'b',
          );

          // act
          const result = compareNodes(nodeA, nodeB);

          // assert
          expect(result).toEqual(-1);
        });
      });
      describe('B.id is before A.id lexicographically', () => {
        it('should return 1', () => {
          // arrange
          const now = Date.now();
          const end = Date.now() + 1;
          const nodeA: NodeInstanceDTO = newMockNodeInstance(
            new Date(now).toISOString(),
            new Date(end).toISOString(),
            'f',
          );
          const nodeB: NodeInstanceDTO = newMockNodeInstance(
            new Date(now).toISOString(),
            new Date(end).toISOString(),
            'e',
          );

          // act
          const result = compareNodes(nodeA, nodeB);

          // assert
          expect(result).toEqual(1);
        });
      });
    });
    describe('Nodes are equal', () => {
      it('should return 0', () => {
        // arrange
        const start = new Date().toISOString();
        const end = new Date().toISOString();
        const nodeA: NodeInstanceDTO = newMockNodeInstance(start, end, 'z');
        const nodeB: NodeInstanceDTO = newMockNodeInstance(start, end, 'z');

        // act
        const result = compareNodes(nodeA, nodeB);

        // assert
        expect(result).toEqual(0);
      });
    });
  });
});
