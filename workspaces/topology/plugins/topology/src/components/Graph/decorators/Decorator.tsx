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
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Decorator as PfDecorator } from '@patternfly/react-topology';

import './Decorator.css';

type DecoratorTypes = {
  x: number;
  y: number;
  radius: number;
  onClick?(event: React.MouseEvent<SVGGElement, MouseEvent>): void;
  href?: string;
  ariaLabel?: string;
  external?: boolean;
  circleRef?: React.Ref<SVGCircleElement>;
};

const Decorator = ({
  x,
  y,
  radius,
  href,
  ariaLabel,
  external,
  ...rest
}: React.PropsWithChildren<DecoratorTypes>) => {
  const decorator = (
    <PfDecorator x={x} y={y} radius={radius} showBackground {...rest} />
  );

  if (href) {
    return external ? (
      <a
        className="bs-topology-decorator__link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => {
          e.stopPropagation();
        }}
        role="button"
        aria-label={ariaLabel}
      >
        {decorator}
      </a>
    ) : (
      <Link
        className="bs-topology-decorator__link"
        to={href}
        role="button"
        aria-label={ariaLabel}
      >
        {decorator}
      </Link>
    );
  }
  return decorator;
};

export default Decorator;
