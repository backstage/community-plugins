/*
 * Copyright 2025 The Backstage Authors
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
import type { FC } from 'react';

interface IconProps {
  color?: string;
}

export const Javascript: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <g id="logo-JS">
      <g id="dc6dc30c06dc72b644a52a54ab4257b8">
        <path
          id="Shape"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.0714 5.32143V13.8806C10.0714 17.7818 8.10061 19.1429 5.20592 19.1429C4.58556 19.1429 3.81474 19.05 3.23551 18.8903L3 18.8178L3.33429 16.3161C3.74939 16.4594 4.2802 16.5604 4.87163 16.5604C6.0884 16.5604 6.80477 16.0122 6.85438 14.0791L6.85714 13.8586V5.32143H10.0714ZM17.0804 5C18.4892 5 19.5226 5.25023 20.3072 5.56686L20.4839 5.64102L19.7161 8.21245L19.4739 8.09071C18.9441 7.83393 18.141 7.51816 17.0437 7.51816C15.7433 7.51816 15.1133 8.14816 15.1133 8.83878C15.1133 9.63358 15.7144 10.0246 17.1264 10.608L17.5745 10.7894C19.9163 11.6839 21 12.9439 21 14.8945C21 17.1922 19.3065 19.1429 15.6624 19.1429C14.2482 19.1429 12.9363 18.7717 12.1584 18.3742L12 18.2888L12.6116 15.7504L12.8 15.8486C13.5792 16.2398 14.6607 16.6045 15.8424 16.6045C17.22 16.6045 17.9492 16.0149 17.9492 15.1002C17.9492 14.306 17.3761 13.8084 15.9443 13.271L15.7231 13.19C13.5171 12.3763 12 11.1182 12 9.1051C12 6.76694 13.969 5 17.0804 5Z"
        />
      </g>
    </g>
  </svg>
);
