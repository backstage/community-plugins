import React from 'react';
import type { SvgIconProps } from '@material-ui/core/SvgIcon';
import { ResourceOptimizationIcon } from './ResourceOptimizationIcon';

/**
 * The filled variant of the Resource Optimization icon.
 *
 * @public
 */
export const ResourceOptimizationIconFilled = (props: SvgIconProps) => {
  return <ResourceOptimizationIcon variant="filled" {...props} />;
};
