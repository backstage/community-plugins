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
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';

interface IconProps {
  color?: string;
}

export const Scala: FC<IconProps> = ({ color: colorProp }) => {
  const theme = useTheme();
  // Use provided color or theme's text color
  const mainColor = colorProp || 'currentColor';
  // Use theme's background color for contrast
  const contrastColor = theme.palette.background.paper;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={mainColor}
      style={{ color: mainColor }}
    >
      <g id="logo-scala">
        <g id="Frame 13153">
          <path
            id="Path"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="currentColor"
            d="M20.9988 7.98573C20.9978 7.80466 20.9958 7.62376 20.9908 7.44251C20.9803 7.04829 20.9571 6.6505 20.887 6.26035C20.8159 5.86426 20.6996 5.49601 20.5165 5.13606C20.3366 4.78274 20.1016 4.45928 19.8212 4.17893C19.5409 3.89858 19.2176 3.66354 18.8641 3.48366C18.5046 3.30072 18.1362 3.18447 17.7405 3.11336C17.3501 3.0431 16.9523 3.01986 16.5578 3.00933C16.3767 3.00441 16.1956 3.00238 16.0146 3.00119C15.7997 3 15.5845 3 15.3697 3H10.6045H8.63067C8.41565 3 8.20063 3 7.98579 3.00119C7.80471 3.00238 7.62346 3.00441 7.44256 3.00933C7.34396 3.01205 7.24519 3.01544 7.14625 3.02019C6.84961 3.03445 6.55245 3.06075 6.26005 3.11336C5.96323 3.16665 5.68186 3.24539 5.40796 3.35858C5.31666 3.39626 5.2262 3.43784 5.13643 3.48366C4.87135 3.61857 4.62307 3.78454 4.39736 3.97733C4.32184 4.04181 4.24921 4.10902 4.17912 4.1791C3.8986 4.45945 3.66356 4.78291 3.48384 5.13623C3.30072 5.49601 3.18465 5.86443 3.11337 6.26052C3.04328 6.6505 3.02003 7.04846 3.00951 7.44268C3.00459 7.62392 3.00238 7.80483 3.00119 7.9859C2.99984 8.20075 3.00001 8.41576 3.00001 8.63061V11.565V15.3694C3.00001 15.5846 2.99984 15.7994 3.00119 16.0146C3.00238 16.1957 3.00442 16.3766 3.00951 16.5575C3.02003 16.9519 3.04345 17.3498 3.11337 17.7396C3.18448 18.1356 3.30056 18.5042 3.48384 18.8639C3.66373 19.2174 3.89877 19.5407 4.17912 19.8209C4.4593 20.1014 4.78276 20.3365 5.13643 20.5165C5.49604 20.6994 5.8643 20.8155 6.26005 20.8866C6.65003 20.9569 7.04816 20.9801 7.44256 20.9907C7.62346 20.9954 7.80471 20.9976 7.98579 20.9986C8.20063 21.0002 8.41548 21 8.63067 21H15.3695C15.5844 21 15.7995 21.0002 16.0144 20.9986C16.1955 20.9976 16.3764 20.9954 16.5576 20.9907C16.9522 20.9801 17.35 20.9567 17.7403 20.8866C18.136 20.8155 18.5043 20.6994 18.8639 20.5165C19.2174 20.3365 19.5407 20.1014 19.821 19.8209C20.1014 19.5405 20.3366 19.2174 20.5163 18.8639C20.6994 18.5042 20.8157 18.1356 20.8868 17.7396C20.9569 17.3498 20.9801 16.9519 20.9907 16.5575C20.9956 16.3766 20.9976 16.1957 20.9986 16.0146C21 15.7994 21 15.5846 21 15.3694V8.63061C21 8.41576 21.0002 8.20075 20.9988 7.98573Z"
          />
          <g id="g2412">
            <g id="g2414">
              <g id="g2416">
                <g id="g2422">
                  <g id="g2424">
                    <path
                      id="path2432"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.50363 9.39278V10.4795C7.50363 10.6627 11.4558 10.9695 14.0307 11.5662V11.5662C15.2746 11.2778 16.1973 10.922 16.1973 10.4795V10.4795V9.39278C16.1973 8.95053 15.2746 8.59435 14.0307 8.30608V8.30608C11.4558 8.90293 7.50363 9.20978 7.50363 9.39278"
                    />
                  </g>
                </g>
              </g>
            </g>
            <g id="g2434">
              <g id="g2436">
                <g id="g2442">
                  <g id="g2444">
                    <path
                      id="path2452"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.50363 13.7396V14.8264C7.50363 15.0096 11.4558 15.3164 14.0307 15.9131V15.9131C15.2746 15.6248 16.1973 15.2689 16.1973 14.8264V14.8264V13.7396C16.1973 13.2974 15.2746 12.9413 14.0307 12.6529V12.6529C11.4558 13.2498 7.50363 13.5566 7.50363 13.7396"
                    />
                  </g>
                </g>
              </g>
            </g>
            <g id="g2554">
              <g id="g2556">
                <g id="g2562">
                  <g id="g2564">
                    <path
                      id="path2572"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      fill={contrastColor}
                      d="M7.50363 11.5663V14.8264C7.50363 14.5547 16.1973 14.0113 16.1973 12.653V12.653V9.39281C16.1973 10.7512 7.50363 11.2945 7.50363 11.5663"
                    />
                  </g>
                </g>
              </g>
            </g>
            <g id="g2574">
              <g id="g2576">
                <g id="g2582">
                  <g id="g2584">
                    <path
                      id="path2592"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      fill={contrastColor}
                      d="M7.50363 15.9131V19.1732C7.50363 18.9015 16.1973 18.3582 16.1973 16.9998V16.9998V13.7397C16.1973 15.0981 7.50363 15.6414 7.50363 15.9131"
                    />
                  </g>
                </g>
              </g>
            </g>
            <g id="g2694">
              <g id="g2696">
                <g id="g2702">
                  <g id="g2704">
                    <path
                      id="path2712"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      fill={contrastColor}
                      d="M7.50363 7.21935V10.4795C7.50363 10.2078 16.1973 9.66443 16.1973 8.30609V8.30609V5.04595C16.1973 6.40432 7.50363 6.94767 7.50363 7.21935"
                    />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_0_1802"
          x1="7.5043"
          y1="7.90011"
          x2="18.3731"
          y2="7.90011"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={contrastColor} stopOpacity="0.7" />
          <stop offset="1" stopColor={contrastColor} stopOpacity="0.25" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_0_1802"
          x1="7.5043"
          y1="12.247"
          x2="18.3731"
          y2="12.247"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={contrastColor} stopOpacity="0.7" />
          <stop offset="1" stopColor={contrastColor} stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>
  );
};
