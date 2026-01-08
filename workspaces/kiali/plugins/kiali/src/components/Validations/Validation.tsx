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
import { ValidationTypes } from '@backstage-community/plugin-kiali-common/types';
import { Typography } from '@material-ui/core';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ComponentClass, CSSProperties } from 'react';
import { kialiStyle } from '../../styles/StyleUtils';
import { PFColors } from '@backstage-community/plugin-kiali-common/styles';

const validationStyle = kialiStyle({
  textAlign: 'left',
  $nest: {
    '&:last-child p': {
      margin: 0,
    },
  },
});

type Props = ValidationDescription & {
  messageColor?: boolean;
  size?: string;
  textStyle?: CSSProperties;
  iconStyle?: CSSProperties;
};

export type ValidationDescription = {
  severity: ValidationTypes;
  message?: string;
};

export type ValidationType = {
  name: string;
  color: string;
  icon: ComponentClass<SvgIconProps>;
};

const ErrorValidation: ValidationType = {
  name: 'Not Valid',
  color: PFColors.Danger,
  icon: ErrorOutlineIcon as any,
};

const WarningValidation: ValidationType = {
  name: 'Warning',
  color: PFColors.Warning,
  icon: WarningAmberIcon as any,
};

const InfoValidation: ValidationType = {
  name: 'Info',
  color: PFColors.Info,
  icon: InfoOutlinedIcon as any,
};

const CorrectValidation: ValidationType = {
  name: 'Valid',
  color: PFColors.Success,
  icon: CheckCircleOutlineIcon as any,
};

export const severityToValidation: { [severity: string]: ValidationType } = {
  error: ErrorValidation,
  warning: WarningValidation,
  correct: CorrectValidation,
  info: InfoValidation,
};

export const Validation = (props: Props) => {
  const validation = () => {
    return severityToValidation[props.severity];
  };

  const severityColor = () => {
    return { color: validation().color };
  };

  const textStyle = () => {
    const colorMessage = props.messageColor || false;
    const textStyleT = props.textStyle || {};
    if (colorMessage) {
      Object.assign(textStyleT, severityColor());
    }
    return textStyleT;
  };

  const iconStyle = () => {
    const iconStyleP = props.iconStyle ? { ...props.iconStyle } : {};
    const defaultStyle: CSSProperties = {
      verticalAlign: '-0.125em',
      marginRight: '0.5rem',
    };
    Object.assign(iconStyleP, severityColor());
    Object.assign(iconStyleP, defaultStyle);
    return iconStyleP;
  };

  const IconComponent = validation().icon;
  const hasMessage = !!props.message;
  if (hasMessage) {
    return (
      <div className={validationStyle}>
        <Typography variant="body2" style={textStyle()}>
          {' '}
          <IconComponent style={iconStyle()} /> {props.message}
        </Typography>
      </div>
    );
  }
  return <IconComponent style={iconStyle()} />;
};
