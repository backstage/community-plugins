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
import { default as React } from 'react';
import { Link } from 'react-router-dom';
import { Paths } from '../../config';
import { FilterSelected } from '../Filters/StatefulFilters';

interface Props {
  namespaces: string[];
  errors?: boolean;
  warnings?: boolean;
}

export class IstioConfigListLink extends React.Component<
  React.PropsWithChildren<Props>
> {
  namespacesToParams = () => {
    let param: string = '';
    if (this.props.namespaces.length > 0) {
      param = `namespaces=${this.props.namespaces.join(',')}`;
    }
    return param;
  };

  validationToParams = () => {
    let params: string = '';

    if (this.props.warnings) {
      params += 'configvalidation=Warning';
    }

    let errorParams: string = '';
    if (this.props.errors) {
      errorParams += 'configvalidation=Not+Valid';
    }

    if (params !== '' && errorParams !== '') {
      params += '&';
    }

    params += errorParams;

    return params;
  };

  cleanFilters = () => {
    FilterSelected.resetFilters();
  };

  render() {
    let params: string = this.namespacesToParams();
    const validationParams: string = this.validationToParams();
    if (params !== '' && validationParams !== '') {
      params += '&';
    }
    params += validationParams;

    return (
      <Link to={`/${Paths.ISTIO}?${params}`} onClick={this.cleanFilters}>
        {this.props.children}
      </Link>
    );
  }
}
