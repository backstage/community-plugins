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
import { ApiiroSmall } from '../../assets/apiiroLogo/apiiroSmall';
import { styled, keyframes } from '@mui/material/styles';
import { getSpinnerColor } from '../../theme/themeUtils';

const rotate3d = keyframes`
  25% {
    transform: rotateX(180deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  75% {
    transform: rotateZ(180deg);
  }
`;

const AnimatedLogo = styled(ApiiroSmall)(({ theme }) => ({
  color: getSpinnerColor(theme),
  animation: `${rotate3d} 3s infinite`,
  display: 'inline-block',
  transformStyle: 'preserve-3d',
}));

export const LogoSpinner = () => {
  return <AnimatedLogo />;
};
