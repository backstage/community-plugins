/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {
  ComponentProps,
  ComponentType,
  MouseEventHandler,
  ReactNode,
  useState,
} from 'react';

import { useApi } from '@backstage/core-plugin-api';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { Entity } from '@backstage/catalog-model';

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Alert from '@material-ui/lab/Alert';

import { techInsightsApiRef } from '../../api';
import { CheckResultRenderer } from '../CheckResultRenderer';
import { ResultLinksMenu, ResultLinksMenuInfo } from '../ResultLinksMenu';

/** @public */
export type ResultCheckIconBaseComponent = ComponentType<{
  onClick?: MouseEventHandler | undefined;
}>;

/**
 * ResultCheckIcon props
 *
 * The only necessary prop is {@link ResultCheckIconProps.result}, but if
 * {@link ResultCheckIconProps.entity} is provided, the popup menu with links
 * will also include links specifically for this entity.
 *
 * @public
 */
export interface ResultCheckIconProps<C extends ResultCheckIconBaseComponent> {
  /**
   * The CheckResult object to create an icon for
   */
  result: CheckResult;
  /**
   * The entity for which this check result is created. This is optional, but if
   * provided, entity-specific links will be added to the popup menu, if any.
   */
  entity?: Entity;
  /**
   * This can optionally be provided, with a small performance improvement, if
   * it is already cashed upstream.
   */
  checkResultRenderer?: CheckResultRenderer;
  /**
   * Will disable the popup menu
   */
  disableLinksMenu?: boolean;
  /**
   * By default, the icon (and the parent `IconButton`) is wrapped inside a
   * `ListItemSecondaryAction` which handles the `onClick` to open the popup
   * menu.
   *
   * This can be changed by providing a custom component here.
   *
   * The {@link ResultCheckIconProps.componentProps} prop can be specified to
   * add props to the wrapping component.
   */
  component?: C;
  /**
   * Props to provide to the wrapping component, which by default is a
   * `ListItemSecondaryAction` but can be overridden using
   * {@link ResultCheckIconProps.component}.
   */
  componentProps?: Omit<ComponentProps<C>, 'onClick'>;
  /**
   * Override the component used to display instead of a result icon, when no
   * renderer was found for this check type.
   */
  missingRendererComponent?: ReactNode;
}

export const ResultCheckIcon = <
  C extends ResultCheckIconBaseComponent = typeof ListItemSecondaryAction,
>(
  props: ResultCheckIconProps<C>,
) => {
  const {
    result,
    entity,
    disableLinksMenu,
    componentProps,
    missingRendererComponent = <Alert severity="error">Unknown type.</Alert>,
  } = props;

  const Component = props.component ?? ListItemSecondaryAction;

  const api = useApi(techInsightsApiRef);

  const checkResultRenderer =
    props.checkResultRenderer ??
    api.getCheckResultRenderers([result.check.type])[0];

  const [menu, setMenu] = useState<ResultLinksMenuInfo | undefined>();

  const iconComponent = checkResultRenderer?.component(result);

  const wrapActions = (component: React.ReactElement): ReactNode => {
    if (!menu) {
      return component;
    }
    return (
      <Component
        {...componentProps}
        onClick={event => menu?.open(event.currentTarget)}
      >
        <IconButton edge="end" aria-label="comments">
          {component}
        </IconButton>
      </Component>
    );
  };

  return (
    <>
      {!disableLinksMenu && (
        <ResultLinksMenu result={result} entity={entity} setMenu={setMenu} />
      )}
      {wrapActions(iconComponent ?? missingRendererComponent)}
    </>
  );
};
