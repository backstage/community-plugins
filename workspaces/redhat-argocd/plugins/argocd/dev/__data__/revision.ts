import { RevisionInfo } from '../../src/types/application';

export const mockRevision: RevisionInfo = {
  author: 'author-name',
  date: new Date('2023-10-10T05:28:38Z'),
  message: 'First release',
};

export const mockRevisionTwo = {
  author: 'author-name',
  date: '2023-10-11T05:28:38Z',
  message: 'Commit v1.0.0 tag release',
};

export const mockRevisionThree = {
  author: 'author-name',
  date: '2023-10-13T05:28:38Z',
  message: 'Initial commit',
};

export const mockRevisions = [mockRevision, mockRevisionTwo, mockRevisionThree];
