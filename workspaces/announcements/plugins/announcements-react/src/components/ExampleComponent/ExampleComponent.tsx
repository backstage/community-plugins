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
import React from 'react';
import { Typography } from '@material-ui/core';

/**
 * Props for {@link ExampleComponent}.
 *
 * @public
 */
export interface ExampleComponentProps {
  message?: string;
}

/**
 * Displays an example.
 *
 * @remarks
 *
 * Longer descriptions should be put after the `@remarks` tag. That way the initial summary
 * will show up in the API docs overview section, while the longer description will only be
 * displayed on the page for the specific API.
 *
 * @public
 */
export function ExampleComponent(props: ExampleComponentProps) {
  // By destructuring props here rather than in the signature the API docs will look nicer
  const { message = 'Hello World' } = props;

  return <Typography variant="h1">{message}</Typography>;
}
