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
import { makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 28,
  },
  path: {
    fill: '#7df3e1',
  },
});

const LogoIcon = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 337.46 428.5"
    >
      <path
        className={classes.path}
        d="M303,166.05a80.69,80.69,0,0,0,13.45-10.37c.79-.77,1.55-1.53,2.3-2.3a83.12,83.12,0,0,0,7.93-9.38A63.69,63.69,0,0,0,333,133.23a48.58,48.58,0,0,0,4.35-16.4c1.49-19.39-10-38.67-35.62-54.22L198.56,0,78.3,115.23,0,190.25l108.6,65.91a111.59,111.59,0,0,0,57.76,16.41c24.92,0,48.8-8.8,66.42-25.69,19.16-18.36,25.52-42.12,13.7-61.87a49.22,49.22,0,0,0-6.8-8.87A89.17,89.17,0,0,0,259,178.29h.15a85.08,85.08,0,0,0,31-5.79A80.88,80.88,0,0,0,303,166.05ZM202.45,225.86c-19.32,18.51-50.4,21.23-75.7,5.9L51.61,186.15l67.45-64.64,76.41,46.38C223,184.58,221.49,207.61,202.45,225.86Zm8.93-82.22-70.65-42.89L205.14,39,274.51,81.1c25.94,15.72,29.31,37,10.55,55A60.69,60.69,0,0,1,211.38,143.64Zm29.86,190c-19.57,18.75-46.17,29.09-74.88,29.09a123.73,123.73,0,0,1-64.1-18.2L0,282.52v24.67L108.6,373.1a111.6,111.6,0,0,0,57.76,16.42c24.92,0,48.8-8.81,66.42-25.69,12.88-12.34,20-27.13,19.68-41.49v-1.79A87.27,87.27,0,0,1,241.24,333.68Zm0-39c-19.57,18.75-46.17,29.08-74.88,29.08a123.81,123.81,0,0,1-64.1-18.19L0,243.53v24.68l108.6,65.91a111.6,111.6,0,0,0,57.76,16.42c24.92,0,48.8-8.81,66.42-25.69,12.88-12.34,20-27.13,19.68-41.5v-1.78A87.27,87.27,0,0,1,241.24,294.7Zm0-39c-19.57,18.76-46.17,29.09-74.88,29.09a123.81,123.81,0,0,1-64.1-18.19L0,204.55v24.68l108.6,65.91a111.59,111.59,0,0,0,57.76,16.41c24.92,0,48.8-8.8,66.42-25.68,12.88-12.35,20-27.13,19.68-41.5v-1.82A86.09,86.09,0,0,1,241.24,255.71Zm83.7,25.74a94.15,94.15,0,0,1-60.2,25.86h0V334a81.6,81.6,0,0,0,51.74-22.37c14-13.38,21.14-28.11,21-42.64v-2.19A94.92,94.92,0,0,1,324.94,281.45Zm-83.7,91.21c-19.57,18.76-46.17,29.09-74.88,29.09a123.73,123.73,0,0,1-64.1-18.2L0,321.5v24.68l108.6,65.9a111.6,111.6,0,0,0,57.76,16.42c24.92,0,48.8-8.8,66.42-25.69,12.88-12.34,20-27.13,19.68-41.49v-1.79A86.29,86.29,0,0,1,241.24,372.66ZM327,162.45c-.68.69-1.35,1.38-2.05,2.06a94.37,94.37,0,0,1-10.64,8.65,91.35,91.35,0,0,1-11.6,7,94.53,94.53,0,0,1-26.24,8.71,97.69,97.69,0,0,1-14.16,1.57c.5,1.61.9,3.25,1.25,4.9a53.27,53.27,0,0,1,1.14,12V217h.05a84.41,84.41,0,0,0,25.35-5.55,81,81,0,0,0,26.39-16.82c.8-.77,1.5-1.56,2.26-2.34a82.08,82.08,0,0,0,7.93-9.38A63.76,63.76,0,0,0,333,172.17a48.55,48.55,0,0,0,4.32-16.45c.09-1.23.2-2.47.19-3.7V150q-1.08,1.54-2.25,3.09A96.73,96.73,0,0,1,327,162.45Zm0,77.92c-.69.7-1.31,1.41-2,2.1a94.2,94.2,0,0,1-60.2,25.86h0l0,26.67h0a81.6,81.6,0,0,0,51.74-22.37A73.51,73.51,0,0,0,333,250.13a48.56,48.56,0,0,0,4.32-16.44c.09-1.24.2-2.47.19-3.71v-2.19c-.74,1.07-1.46,2.15-2.27,3.21A95.68,95.68,0,0,1,327,240.37Zm0-39c-.69.7-1.31,1.41-2,2.1a93.18,93.18,0,0,1-10.63,8.65,91.63,91.63,0,0,1-11.63,7,95.47,95.47,0,0,1-37.94,10.18h0V256h0a81.65,81.65,0,0,0,51.74-22.37c.8-.77,1.5-1.56,2.26-2.34a82.08,82.08,0,0,0,7.93-9.38A63.76,63.76,0,0,0,333,211.15a48.56,48.56,0,0,0,4.32-16.44c.09-1.24.2-2.48.19-3.71v-2.2c-.74,1.08-1.46,2.16-2.27,3.22A95.68,95.68,0,0,1,327,201.39Z"
      />
    </svg>
  );
};

export default LogoIcon;
