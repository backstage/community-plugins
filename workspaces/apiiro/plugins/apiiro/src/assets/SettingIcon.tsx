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
import { styled } from '@mui/material/styles';
import { CustomTooltip } from '../components/common';

const StyledSvg = styled('svg')({
  cursor: 'pointer',
  '&:hover': {
    '& path': {
      opacity: 0.8,
    },
  },
});

export const SettingIcon = () => {
  const theme = useTheme();
  const iconColor = theme.palette.mode === 'dark' ? '#ffffff' : '#8a8fa8';

  return (
    <CustomTooltip
      title="Configure branches via connection page"
      placement="top"
    >
      <StyledSvg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        data-name="Settings"
        data-size="small"
      >
        <path
          fill="none"
          stroke={iconColor}
          strokeWidth="1.2"
          d="m9.479 5.423.613-1.537c.103-.26.284-.484.52-.642s.517-.243.804-.244h1.168c.287 0 .567.086.803.244s.418.382.521.642l.613 1.537 2.08 1.163 1.68-.25c.28-.036.565.009.818.13.254.12.465.312.606.55l.57.969a1.355 1.355 0 0 1-.114 1.564l-1.04 1.288v2.326l1.069 1.288a1.353 1.353 0 0 1 .114 1.565l-.57.969a1.4 1.4 0 0 1-.606.55 1.46 1.46 0 0 1-.818.128l-1.681-.25-2.08 1.164-.612 1.537c-.103.26-.285.484-.521.642a1.45 1.45 0 0 1-.804.244h-1.196c-.287 0-.567-.086-.803-.244a1.4 1.4 0 0 1-.521-.642l-.613-1.537-2.08-1.163-1.68.25a1.46 1.46 0 0 1-.818-.13 1.4 1.4 0 0 1-.606-.55l-.57-.969a1.35 1.35 0 0 1 .114-1.564l1.04-1.288v-2.326L3.81 9.549a1.354 1.354 0 0 1-.114-1.565l.57-.969a1.4 1.4 0 0 1 .606-.55 1.46 1.46 0 0 1 .818-.128l1.681.25 2.08-1.163zM9.151 12c0 .548.168 1.083.48 1.539.314.455.758.81 1.279 1.02s1.093.264 1.646.157a2.87 2.87 0 0 0 1.458-.758c.399-.387.67-.88.78-1.418a2.7 2.7 0 0 0-.162-1.6 2.8 2.8 0 0 0-1.05-1.243A2.9 2.9 0 0 0 12 9.231a2.9 2.9 0 0 0-2.014.81 2.73 2.73 0 0 0-.835 1.96z"
        />
      </StyledSvg>
    </CustomTooltip>
  );
};

export default SettingIcon;
