import { useEntity } from '@backstage/plugin-catalog-react';

import { renderHook } from '@testing-library/react';

import { mockEntity } from '../__fixtures__/mockEntity';
import { useAcrAppData } from './useAcrAppData';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn().mockReturnValue({}),
}));

describe('useAcrData', () => {
  beforeEach(() => {
    (useEntity as jest.Mock).mockClear();
  });

  it('should return image name', () => {
    (useEntity as jest.Mock).mockReturnValue({ entity: mockEntity });
    const { result } = renderHook(() => useAcrAppData());
    expect(result.current.imageName).toEqual(
      'janus-idp/redhat-backstage-image',
    );
  });

  it('should throw error if annotations are not passed', () => {
    (useEntity as jest.Mock).mockReturnValue({
      entity: {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'foo',
          annotations: { 'quay.io/repository-slug': 'foo/bar' },
        },
      },
    });
    const useResult = () => useAcrAppData();
    expect(useResult).toThrow(
      Error("'Azure container registry' annotations are missing"),
    );
  });
});
