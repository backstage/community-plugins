/*
 * Copyright 2021 The Backstage Authors
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
import { RiCheckboxCircleLine, RiErrorWarningLine } from '@remixicon/react';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';

/**
 * A component that renders a boolean check result as either a success or failure icon.
 *
 * @public
 */
export const BooleanCheck = (props: { checkResult: CheckResult }) => {
  return !!props.checkResult.result ? (
    <RiCheckboxCircleLine
      size={24}
      color="var(--bui-fg-positive)"
      aria-label="Passed"
    />
  ) : (
    <RiErrorWarningLine
      size={24}
      color="var(--bui-fg-negative)"
      aria-label="Failed"
    />
  );
};

/**
 * Helper function to determine if a boolean check result represents a failure.
 *
 * @returns true if the check result represents a failure (result is false), false otherwise
 *
 * @public
 */
export const isBooleanCheckFailed = (checkResult: CheckResult) =>
  !checkResult.result;
