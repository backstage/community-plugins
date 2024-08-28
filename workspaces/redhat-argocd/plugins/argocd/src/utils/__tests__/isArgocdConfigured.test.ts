import { mockEntity } from '../../../dev/__data__';
import { isArgocdConfigured } from '../isArgocdConfigured';

describe('isArgocdConfigured', () => {
  test('should return false if argocd is not configured', () => {
    expect(
      isArgocdConfigured({
        ...mockEntity,
        metadata: {
          ...mockEntity.metadata,
          annotations: {},
        },
      }),
    ).toBe(false);
  });

  test('should return true if argocd is configured', () => {
    expect(isArgocdConfigured(mockEntity)).toBe(true);
  });
});
