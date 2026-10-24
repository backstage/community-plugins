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
import { ReactNode } from 'react';

/**
 * Returns the props that mark an element as a tour target, for spreading
 * onto any element: `<div {...guidedTourTargetProps('example.todos')} />`.
 *
 * @public
 */
export function guidedTourTargetProps(id: string): {
  'data-guided-tour': string;
} {
  return { 'data-guided-tour': id };
}

/**
 * Wraps children in a `span` marked as a tour target, for components that
 * do not forward unknown props.
 *
 * @public
 */
export function GuidedTourTarget(props: {
  id: string;
  children: ReactNode;
  as?: 'span' | 'div';
}) {
  const { id, children, as: Component = 'span' } = props;
  return (
    <Component data-guided-tour={id} style={{ display: 'contents' }}>
      {children}
    </Component>
  );
}
