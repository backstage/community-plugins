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

import { t_color_yellow_40 as mediumColor } from '@patternfly/react-tokens/dist/js/t_color_yellow_40';

const EqualsIcon = ({
  className,
  title,
}: {
  className: string;
  title?: string;
}): ReactElement => {
  return (
    <svg
      viewBox="0 -960 960 960"
      fill={mediumColor.value}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {title && <title>{title}</title>}
      <path d="M160-280v-120h640v120H160Zm0-280v-120h640v120H160Z" />
    </svg>
  );
};

export default EqualsIcon;
