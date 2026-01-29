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
export const NoResultsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="129"
    height="62"
    fill="none"
    viewBox="0 0 129 62"
  >
    <ellipse cx="64.5" cy="47" fill="#E2E2E9" rx="31" ry="2" />
    <path
      fill="#21263F"
      d="M91.507 36.412a3.534 3.534 0 0 1 3.22 3.804 3.5 3.5 0 0 1-3.803 3.193l-.606-.053.583-6.996z"
    />
    <path
      fill="#B6B9C9"
      d="m55.207 45.231 1.367-16.421 29.72 3.929c3.76.497 6.475 3.85 6.162 7.612-.316 3.789-3.59 6.635-7.403 6.436z"
    />
    <path
      fill="#414558"
      fillRule="evenodd"
      d="M60.23 37.547c.4-4.817-.152-8.798-1.231-8.892l.005-.065-9.908-1.834-1.606 19.39 10.054.064.01-.112c1.079.094 2.277-3.734 2.676-8.551"
      clipRule="evenodd"
    />
    <path
      fill="#B6B9C9"
      fillRule="evenodd"
      d="M58.19 37.384c.49-5.92-.187-10.813-1.514-10.929l.007-.08-12.177-2.254-1.975 23.83 12.357.08.012-.138c1.326.115 2.8-4.59 3.29-10.51"
      clipRule="evenodd"
    />
    <path
      fill="#356478"
      d="M44.582 24.053c1.37.119 2.034 5.563 1.483 12.16-.55 6.596-2.107 11.847-3.477 11.729-1.37-.12-2.034-5.563-1.483-12.16.55-6.596 2.107-11.848 3.477-11.729"
    />
    <g filter="url(#no-results-flashlight_svg__a)">
      <g filter="url(#no-results-flashlight_svg__b)">
        <path
          fill="#414558"
          d="M74.566 36.596a2.467 2.467 0 0 1 2.249 2.66 2.45 2.45 0 0 1-2.659 2.234l-5.364-.464a2.467 2.467 0 0 1-2.25-2.659 2.45 2.45 0 0 1 2.66-2.234z"
        />
      </g>
      <path
        fill="#11E4CB"
        d="M70.785 37.078a1.66 1.66 0 0 1 1.512 1.788 1.65 1.65 0 0 1-1.787 1.503l-1.222-.106a1.66 1.66 0 0 1-1.512-1.788 1.65 1.65 0 0 1 1.787-1.503z"
      />
    </g>
    <defs>
      <filter
        id="no-results-flashlight_svg__a"
        width="18.29"
        height="13.376"
        x="62.534"
        y="34.123"
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1220_29836"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1220_29836"
          result="shape"
        />
      </filter>
      <filter
        id="no-results-flashlight_svg__b"
        width="10.29"
        height="5.376"
        x="66.534"
        y="36.123"
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation="1.3" />
        <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0.0627451 0 0 0 0 0.0705882 0 0 0 0 0.117647 0 0 0 1 0" />
        <feBlend in2="shape" result="effect1_innerShadow_1220_29836" />
      </filter>
    </defs>
  </svg>
);

export default NoResultsIcon;
