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
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { argocdTranslationRef } from '../translations';

/**
 * Hook using translation function for ArgoCD plugin
 */
export const useTranslation = () => {
  const { t: originalT } = useTranslationRef(argocdTranslationRef);

  const t = (key: string, params?: Record<string, any>) => {
    return originalT(key as any, params as any);
  };

  return { t };
};
