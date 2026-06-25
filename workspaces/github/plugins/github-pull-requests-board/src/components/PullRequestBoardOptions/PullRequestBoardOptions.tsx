/*
 * Copyright 2022 The Backstage Authors
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
import { ReactNode, FunctionComponent } from 'react';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { Tooltip, Flex, TooltipTrigger } from '@backstage/ui';
import { PRCardFormating } from '../../utils/types';

type Option = {
  icon: ReactNode;
  value: string;
  ariaLabel: string;
};

type Props = {
  value: string[];
  onClickOption: (selectedOptions: PRCardFormating[]) => void;
  options: Option[];
};

const PullRequestBoardOptions: FunctionComponent<Props> = (props: Props) => {
  const { value, onClickOption, options } = props;
  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      onChange={(_event, selectedOptions) => onClickOption(selectedOptions)}
      aria-label="Pull Request board settings"
    >
      {options.map(({ icon, value: toggleValue, ariaLabel }, index) => (
        <ToggleButton
          value={toggleValue}
          aria-label={ariaLabel}
          title={ariaLabel}
          key={`${ariaLabel}-${index}`}
        >
          <TooltipTrigger>
            <Flex justify="center" align="center">
              {icon}
            </Flex>
            <Tooltip>{ariaLabel}</Tooltip>
          </TooltipTrigger>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default PullRequestBoardOptions;
