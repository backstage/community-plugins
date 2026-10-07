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
import type { ReactElement } from 'react';

import {
  ElementType,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  useState,
} from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { Entity } from '@backstage/catalog-model';
import { Alert, ButtonIcon } from '@backstage/ui';
import { techInsightsApiRef } from '../../api';
import { ResultLinksMenu, ResultLinksMenuInfo } from '../ResultLinksMenu';
import { CheckResultRenderer } from '../CheckResultRenderer';

// react-aria stops click propagation by default, which would hide the click
// from a wrapping `component` that owns the onClick. Let it bubble, as the
// original MUI IconButton did.
const continuePropagation = (e: { continuePropagation: () => void }) =>
  e.continuePropagation();

/** @public */
export type ResultCheckIconBaseComponentProps = PropsWithChildren<{
  onClick?: MouseEventHandler;
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
export interface ResultCheckIconProps<
  P extends ResultCheckIconBaseComponentProps,
> {
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
   * The icon is rendered within a button which handles the onClick.
   * To wrap this in another component, handling the onClick, pass a component
   * which handles the `onClick` to open the popup menu. The popup menu is then
   * anchored to that component.
   *
   * The {@link ResultCheckIconProps.componentProps} prop can be specified to
   * add props to the wrapping component.
   */
  component?: ElementType<P>;
  /**
   * Props to provide to the wrapping component
   * {@link ResultCheckIconProps.component}.
   */
  componentProps?: Omit<P, 'onClick' | 'children'>;
  /**
   * Override the component used to display instead of a result icon, when no
   * renderer was found for this check type.
   */
  missingRendererComponent?: ReactNode;
}

/**
 * A component that renders an icon representing a check result, optionally with a popup menu
 * containing links related to the check.
 *
 * @public
 */
export const ResultCheckIcon = <P extends ResultCheckIconBaseComponentProps>(
  props: ResultCheckIconProps<P>,
) => {
  const {
    result,
    entity,
    disableLinksMenu,
    component,
    componentProps,
    missingRendererComponent = <Alert status="danger" title="Unknown type." />,
  } = props;

  const api = useApi(techInsightsApiRef);

  const checkResultRenderer =
    props.checkResultRenderer ??
    api.getCheckResultRenderers([result.check.type])[0];

  const [menu, setMenu] = useState<ResultLinksMenuInfo | undefined>();

  const iconComponent = checkResultRenderer?.component(result);

  const onClick: MouseEventHandler = event => {
    menu?.open(event.currentTarget);
  };

  const wrapActions = (inner: ReactElement): ReactNode => {
    if (!menu) {
      if (component) {
        const Component =
          component as ElementType<ResultCheckIconBaseComponentProps>;
        return <Component {...componentProps}>{inner}</Component>;
      }
      return inner;
    }

    const button = (
      <ButtonIcon
        aria-label="icon"
        variant="tertiary"
        size="small"
        icon={inner}
        onClick={component ? undefined : onClick}
        onPressStart={continuePropagation}
        onPressUp={continuePropagation}
        onPressEnd={continuePropagation}
      />
    );

    if (component) {
      const Component =
        component as ElementType<ResultCheckIconBaseComponentProps>;
      return (
        <Component {...componentProps} onClick={onClick}>
          {button}
        </Component>
      );
    }
    return button;
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
