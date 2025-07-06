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
import { Label as PfLabel } from '@patternfly/react-core';
import { default as React } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';
import { canRender } from '../../utils/SafeRender';

interface Props {
  name: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  value: string;
}

const labelStyle = kialiStyle({
  display: 'block',
  float: 'left',
  fontSize: 'var(--kiali-global--font-size)',
  margin: '0 0.25rem 0.25rem 0',
  maxWidth: '100%',
});

export const Label = (props: Props) => {
  const { name, value } = props;
  let label = 'This label has an unexpected format';

  if (canRender(name) && canRender(value)) {
    label = value && value.length > 0 ? `${name}=${value}` : name;
  }

  return (
    <PfLabel
      className={labelStyle}
      tooltipPosition="top"
      style={props.style}
      onClick={props.onClick}
      textMaxWidth="500px"
    >
      {label}
    </PfLabel>
  );
};
