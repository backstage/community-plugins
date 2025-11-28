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
import type { FC } from 'react';

interface IconProps {
  color?: string;
}

export const PHP: FC<IconProps> = ({ color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ color }}
  >
    <path d="M3.579 9.109h2.96c.868.007 1.497.258 1.887.75.39.494.52 1.167.387 2.021-.052.39-.166.773-.343 1.149a3.41 3.41 0 01-.706 1.016c-.368.382-.762.625-1.182.728-.42.103-.854.155-1.303.155H3.954l-.42 2.098H2l1.579-7.917m1.292 1.259l-.663 3.312a.754.754 0 00.133.011h.154c.707.008 1.296-.062 1.767-.21.471-.154.788-.691.95-1.612.132-.773 0-1.218-.398-1.336-.39-.117-.88-.173-1.468-.165-.089.007-.173.01-.254.01H4.86l.01-.01M10.561 7h1.524l-.43 2.109h1.368c.751.015 1.31.17 1.679.464.375.294.486.854.33 1.678l-.739 3.677h-1.546l.707-3.511c.073-.368.051-.63-.066-.784-.118-.155-.372-.232-.762-.232L11.4 10.39l-.905 4.538H8.97L10.561 7m6.109 2.109h2.958c.869.007 1.498.258 1.888.75.39.494.52 1.167.387 2.021-.052.39-.166.773-.342 1.149-.17.375-.405.714-.707 1.016-.368.382-.762.625-1.181.728-.42.103-.854.155-1.303.155h-1.325l-.42 2.098H15.09l1.58-7.917m1.291 1.259l-.662 3.312a.735.735 0 00.132.011h.155c.706.008 1.295-.062 1.766-.21.471-.154.788-.691.95-1.612.132-.773 0-1.218-.398-1.336-.39-.117-.88-.173-1.468-.165-.088.007-.173.01-.254.01h-.232l.011-.01" />
  </svg>
);
