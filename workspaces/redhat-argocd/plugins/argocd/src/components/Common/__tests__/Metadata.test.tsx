import React from 'react';

import { render, screen } from '@testing-library/react';

import Metadata from '../Metadata';
import MetadataItem from '../MetadataItem';

describe('Metadata', () => {
  test('should  render Metadata and MetadataItem', () => {
    render(
      <Metadata data-testid="metadata">
        <MetadataItem data-testid="metadata-item" title="One">
          Item 1
        </MetadataItem>
      </Metadata>,
    );
    expect(screen.queryByTestId('metadata')).toBeInTheDocument();
    expect(screen.queryByTestId('metadata-item')).toBeInTheDocument();
  });
});
