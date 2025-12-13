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
export const RiskLevel = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="#fff"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M4.515 20.9h14.972c1.533 0 2.483-1.75 1.72-3.144l-7.485-13.62a1.945 1.945 0 0 0-3.441 0l-7.488 13.62c-.762 1.395.188 3.145 1.72 3.145z"
      />
      <path d="M12 8.6c-.82 0-1.46.699-1.46 1.51v3.029c0 .81.64 1.51 1.46 1.51s1.46-.7 1.46-1.51v-3.03c0-.81-.64-1.51-1.46-1.51Zm0 7c-.351 0-.71.113-.992.365a1.46 1.46 0 0 0-.469 1.094v.03c0 .801.66 1.46 1.461 1.46.8 0 1.46-.659 1.46-1.46v-.03c0-.445-.185-.843-.468-1.094A1.48 1.48 0 0 0 12 15.6" />
    </svg>
  );
};

export default RiskLevel;
