import React from 'react';
import { DrawerProvider, useDrawerContext } from '../DrawerContext';
import { screen, render, renderHook } from '@testing-library/react';
import { mockApplication } from '../../../../dev/__data__';
import { Application } from '../../../types/application';

const MockComponent = () => {
  const { application, appHistory, latestRevision } = useDrawerContext();

  if (!application) {
    return null;
  }
  return (
    <>
      <div>{application?.metadata?.name}</div>
      <div>{`History: ${appHistory.length}`}</div>
      <div>{`LatestRevision: ${latestRevision.id}`}</div>
    </>
  );
};

describe('DrawerContext', () => {
  it('should not render the mock element if application is missing', () => {
    const { container } = render(
      <DrawerProvider
        application={null as unknown as Application}
        revisionsMap={{}}
      >
        <MockComponent />
      </DrawerProvider>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render the mock element with correct data', () => {
    render(
      <DrawerProvider application={mockApplication} revisionsMap={{}}>
        <MockComponent />
      </DrawerProvider>,
    );

    expect(screen.queryByText('quarkus-app-dev')).toBeInTheDocument();
    expect(screen.queryByText('History: 2')).toBeInTheDocument();
    expect(screen.queryByText('LatestRevision: 1')).toBeInTheDocument();
  });

  it('should throw an error if useDrawerContext is used outside of the provider', () => {
    expect(() =>
      renderHook(() => useDrawerContext(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <>{children}</>
        ),
      }),
    ).toThrow(
      new Error('useDrawerContext must be used within an DrawerProvider'),
    );
  });
});
