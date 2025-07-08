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

import { CustomSvgIcon } from './CustomSvgIcon';

export const ClosedIcon = (props: any) => (
  <CustomSvgIcon
    viewBox="0 0 16 16"
    path={
      <path d="M2.333 8.667c-.278 0-.486-.236-.65-.4-.163-.163-.4-.372-.4-.65s.236-.486.4-.65c.163-.163.372-.4.65-.4h4c.278 0 .486.236.65.4.163.163.4.372.4.65s-.236.486-.4.65c-.163.163-.372.4-.65.4h-4Zm7.333 0c-.278 0-.486-.236-.65-.4-.163-.163-.4-.372-.4-.65s.236-.486.4-.65c.163-.163.372-.4.65-.4h4c.278 0 .486.236.65.4.163.163.4.372.4.65s-.236.486-.4.65c-.163.163-.372.4-.65.4h-4Z" />
    }
    {...props}
  />
);
