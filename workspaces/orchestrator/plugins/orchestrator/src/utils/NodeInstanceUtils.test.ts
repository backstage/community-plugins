import { NodeInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { compareNodes } from './NodeInstanceUtils';

const newMockNodeInstance = (
  enter: NodeInstance['enter'] = new Date(),
  exit?: NodeInstance['exit'],
  id: NodeInstance['id'] = '1',
): NodeInstance => {
  const subject: NodeInstance = {
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
        const nodeA: NodeInstance = newMockNodeInstance(new Date(now));
        const nodeB: NodeInstance = newMockNodeInstance(new Date(now + 1));

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
        const nodeB: NodeInstance = newMockNodeInstance(new Date(now));
        const nodeA: NodeInstance = newMockNodeInstance(new Date(now + 1));

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
            const nodeA: NodeInstance = newMockNodeInstance(
              new Date(now),
              new Date(now + 1),
            );
            const nodeB: NodeInstance = newMockNodeInstance(
              new Date(now),
              new Date(now + 2),
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
            const nodeB: NodeInstance = newMockNodeInstance(
              new Date(now),
              new Date(now + 1),
            );
            const nodeA: NodeInstance = newMockNodeInstance(
              new Date(now),
              new Date(now + 2),
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
          const nodeA: NodeInstance = newMockNodeInstance(
            new Date(now),
            new Date(now + 1),
          );
          const nodeB: NodeInstance = newMockNodeInstance(new Date(now));

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
          const nodeB: NodeInstance = newMockNodeInstance(
            new Date(now),
            new Date(now + 1),
          );
          const nodeA: NodeInstance = newMockNodeInstance(new Date(now));

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
          const nodeA: NodeInstance = newMockNodeInstance(
            new Date(now),
            new Date(end),
            'a',
          );
          const nodeB: NodeInstance = newMockNodeInstance(
            new Date(now),
            new Date(end),
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
          const nodeA: NodeInstance = newMockNodeInstance(
            new Date(now),
            new Date(end),
            'f',
          );
          const nodeB: NodeInstance = newMockNodeInstance(
            new Date(now),
            new Date(end),
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
        const start = new Date();
        const end = new Date();
        const nodeA: NodeInstance = newMockNodeInstance(start, end, 'z');
        const nodeB: NodeInstance = newMockNodeInstance(start, end, 'z');

        // act
        const result = compareNodes(nodeA, nodeB);

        // assert
        expect(result).toEqual(0);
      });
    });
  });
});
