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

type TextOrLinkProps = {
  text: string;
  urlTruncate?: number;
};

export const TextOrLink: React.FC<TextOrLinkProps> = (
  props: TextOrLinkProps,
) => {
  if (props.text.startsWith('http://') || props.text.startsWith('https://')) {
    let truncated = props.text;

    if (props.urlTruncate && props.text.length > props.urlTruncate) {
      truncated = `${props.text.substring(
        0,
        props.urlTruncate / 2,
      )}...${props.text.substring(props.text.length - props.urlTruncate / 2)}`;
    }

    return (
      <a href={props.text} target="_blank" rel="noopener noreferrer">
        {truncated}
      </a>
    );
  }

  return <>{props.text}</>;
};
