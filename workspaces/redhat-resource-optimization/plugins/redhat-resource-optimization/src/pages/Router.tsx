import { ErrorPage } from '@backstage/core-components';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { optimizationsBreakdownRouteRef } from '../routes';
import { ResourceOptimizationIndexPage } from './resource-optimization-index/ResourceOptimizationIndexPage';
// import { OptimizationsBreakdownPage } from './optimizations-breakdown';
import { RosDetailComponent as OptimizationsBreakdownPage } from '../components/RosDetailComponent'; // TODO(jkilzi): replace with th eline above after PoC

/** @public */
export function Router() {
  return (
    <Routes>
      <Route path="/" element={<ResourceOptimizationIndexPage />} />
      <Route
        path={optimizationsBreakdownRouteRef.path}
        element={<OptimizationsBreakdownPage />}
      />
      <Route
        path="*"
        element={<ErrorPage status="404" statusMessage="Page not found" />}
      />
    </Routes>
  );
}
