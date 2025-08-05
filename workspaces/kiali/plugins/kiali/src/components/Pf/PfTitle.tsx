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

import {
  ApplicationsIcon,
  BundleIcon,
  ServiceIcon,
} from '@patternfly/react-icons';
import { default as React } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';
import { MissingSidecar } from '../MissingSidecar/MissingSidecar';

const PfTitleStyle = kialiStyle({
  fontSize: '19px',
  fontWeight: 400,
  margin: '20px 0',
  padding: '0',
});

interface PfTitleProps {
  location?: {
    pathname: string;
    search: string;
  };
  istio?: boolean;
}

const namespaceRegex =
  /namespaces\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z0-9-]+)(\/([a-z0-9-]+))?(\/([a-z0-9-]+))?/;

export const PfTitle = (props: PfTitleProps) => {
  const [namespace, setNamespace] = React.useState<string>('');
  const [name, setName] = React.useState<string>('');
  const [icon, setIcon] = React.useState<JSX.Element>(<></>);

  const doRefresh = () => {
    let typeP = '';
    if (props.location) {
      const match = props.location.pathname.match(namespaceRegex) || [];
      setNamespace(match[1]);
      typeP = match[2];
      setName(match[3]);
    }
    switch (typeP) {
      case 'services':
        setIcon(<ServiceIcon />);
        break;
      case 'workloads':
        setIcon(<BundleIcon />);
        break;
      case 'applications':
        setIcon(<ApplicationsIcon />);
        break;
      default:
    }
  };

  React.useEffect(() => {
    doRefresh();
    // eslint-disable-next-line
  }, []);

  return (
    <h2 className={PfTitleStyle}>
      {icon} {name}
      {name && props.istio !== undefined && !props.istio && (
        <span style={{ marginLeft: '10px' }}>
          <MissingSidecar namespace={namespace} />
        </span>
      )}
    </h2>
  );
};
