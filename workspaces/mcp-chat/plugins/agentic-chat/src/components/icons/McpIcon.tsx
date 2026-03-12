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
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

/**
 * MCP (Model Context Protocol) logo icon
 * Accurate representation of the official MCP logo - intertwined paperclip/connector design
 */
export const McpIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* MCP Logo - Two intertwined curved lines forming connector pattern */}
      {/* First curved line - starts top, goes down-left, curves up-right, ends bottom */}
      <path
        d="M12 1
           C12 1 12 1 12 1
           C7.5 1 4 4.5 4 8
           C4 11 6 13.5 9 14.5
           C9 14.5 9 16 9 16
           C9 19.5 11.5 22 15 22
           C15 22 15 22 15 22
           L15 19
           C13 19 11.5 17.5 11.5 15.5
           L11.5 13
           C8 12 6.5 10 6.5 7.5
           C6.5 5 8.5 3 12 3
           L12 1
           Z"
        fill="currentColor"
      />
      {/* Second curved line - starts bottom, goes up-right, curves down-left, ends top */}
      <path
        d="M12 23
           C12 23 12 23 12 23
           C16.5 23 20 19.5 20 16
           C20 13 18 10.5 15 9.5
           C15 9.5 15 8 15 8
           C15 4.5 12.5 2 9 2
           C9 2 9 2 9 2
           L9 5
           C11 5 12.5 6.5 12.5 8.5
           L12.5 11
           C16 12 17.5 14 17.5 16.5
           C17.5 19 15.5 21 12 21
           L12 23
           Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};

/**
 * Alternative MCP icon - simplified version for very small sizes
 */
export const McpLogoIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M12 2C8 2 5 5 5 8.5C5 11 6.5 13 9 14V16C9 18.5 11 21 14 21V18.5C12.5 18.5 11.5 17.5 11.5 16V12.5C8.5 11.5 7 9.5 7 7.5C7 5.5 9 4 12 4V2Z"
        fill="currentColor"
      />
      <path
        d="M12 22C16 22 19 19 19 15.5C19 13 17.5 11 15 10V8C15 5.5 13 3 10 3V5.5C11.5 5.5 12.5 6.5 12.5 8V11.5C15.5 12.5 17 14.5 17 16.5C17 18.5 15 20 12 20V22Z"
        fill="currentColor"
      />
    </SvgIcon>
  );
};
