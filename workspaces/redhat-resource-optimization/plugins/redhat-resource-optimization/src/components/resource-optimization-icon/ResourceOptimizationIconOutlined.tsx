import React from 'react';
import type { SvgIconProps } from '@material-ui/core/SvgIcon';
import { ResourceOptimizationIcon } from './ResourceOptimizationIcon';

/**
 * The outlined variant of the Resource Optimization icon.
 *
 * @public
 */
export const ResourceOptimizationIconOutlined = (props: SvgIconProps) => {
  return <ResourceOptimizationIcon variant="outlined" {...props} />;
};
