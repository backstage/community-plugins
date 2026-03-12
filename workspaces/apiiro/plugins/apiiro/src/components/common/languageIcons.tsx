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
import * as icons from '../../assets/languageIcons';

export type LanguageKey =
  | 'Java'
  | 'C#'
  | 'TypeScript'
  | 'JavaScript'
  | 'Python'
  | 'Kotlin'
  | 'C'
  | 'C++'
  | 'Visual Basic'
  | 'HTML'
  | 'Objective-C'
  | 'Swift'
  | 'Perl'
  | 'Ruby'
  | 'Go'
  | 'Rust'
  | 'Clojure'
  | 'Scala'
  | 'PHP'
  | 'Dart'
  | 'HCL'
  | 'CI/CD'
  | 'Groovy'
  | 'Yaml'
  | 'Terraform'
  | 'Unknown';

export interface LanguageIconProps {
  color?: string;
}

export const languageIconMap: Record<
  LanguageKey,
  React.FC<LanguageIconProps>
> = {
  Java: icons.Java,
  'C#': icons.Csharp,
  JavaScript: icons.Javascript,
  TypeScript: icons.Typescript,
  Python: icons.Python,
  Kotlin: icons.Kotlin,
  C: icons.C,
  'C++': icons.Cpp,
  'Visual Basic': icons.VB,
  HTML: icons.HTML,
  'Objective-C': icons.ObjectiveC,
  Swift: icons.Swift,
  Perl: icons.Perl,
  Ruby: icons.Ruby,
  Go: icons.Go,
  Rust: icons.Rust,
  Clojure: icons.Clojure,
  Scala: icons.Scala,
  PHP: icons.PHP,
  Dart: icons.Dart,
  HCL: icons.HclLanguage,
  'CI/CD': icons.Cicd,
  Groovy: icons.Groovy,
  Yaml: icons.YAML,
  Terraform: icons.Terraform,
  Unknown: icons.Unknown,
};
