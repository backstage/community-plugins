/*
 * Copyright 2026 The Backstage Authors
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
  errorApiRef,
  useApi,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import { Alert } from '@backstage/ui';
import { Component, ErrorInfo, ReactNode } from 'react';
import { guidedTourTranslationRef } from '../../translation';

/** The inline error shown in place of a step's content. */
export function StepContentError({ error }: { error: Error }) {
  const { t } = useTranslationRef(guidedTourTranslationRef);
  return (
    <Alert
      status="danger"
      title={t('overlay.contentError')}
      description={error.message}
    />
  );
}

interface BoundaryProps {
  children: ReactNode;
  onError(error: Error): void;
}

class Boundary extends Component<BoundaryProps, { error?: Error }> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state: { error?: Error } = {};

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  render() {
    if (this.state.error) {
      return <StepContentError error={this.state.error} />;
    }
    return this.props.children;
  }
}

/**
 * Keeps a step whose content throws while rendering from taking the whole
 * overlay down: only the card body is replaced by an error, the buttons
 * keep working, and the error is reported to the error API. Give it a
 * `key` per step so it resets when the step changes.
 */
export function StepContentBoundary({ children }: { children: ReactNode }) {
  const errorApi = useApi(errorApiRef);
  return (
    <Boundary onError={error => errorApi.post(error)}>{children}</Boundary>
  );
}
