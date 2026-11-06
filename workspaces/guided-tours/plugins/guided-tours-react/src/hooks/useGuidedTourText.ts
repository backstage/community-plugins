/*
 * Copyright 2026 The Backstage Authors
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
import {
  translationApiRef,
  TranslationSnapshot,
  useApi,
} from '@backstage/frontend-plugin-api';
import { useEffect, useState } from 'react';
import { GuidedTourText, isGuidedTourTranslatedText } from '../types';

type Snapshot = TranslationSnapshot<{ [key in string]: string }>;

/**
 * Resolves a step text: plain strings are returned as they are, translated
 * texts are looked up in the translation API and follow language changes.
 *
 * @public
 */
export function useGuidedTourText(text: GuidedTourText): string;
/**
 * Resolves an optional step text; `undefined` stays `undefined`.
 *
 * @public
 */
export function useGuidedTourText(
  text: GuidedTourText | undefined,
): string | undefined;
export function useGuidedTourText(
  text: GuidedTourText | undefined,
): string | undefined {
  const translationApi = useApi(translationApiRef);
  const translationRef = isGuidedTourTranslatedText(text)
    ? text.translationRef
    : undefined;
  const [snapshot, setSnapshot] = useState<Snapshot | undefined>(() =>
    translationRef ? translationApi.getTranslation(translationRef) : undefined,
  );

  useEffect(() => {
    if (!translationRef) {
      return undefined;
    }
    setSnapshot(translationApi.getTranslation(translationRef));
    const subscription = translationApi.translation$(translationRef).subscribe({
      next: next => {
        if (next.ready) {
          setSnapshot(next);
        }
      },
    });
    return () => subscription.unsubscribe();
  }, [translationApi, translationRef]);

  if (!isGuidedTourTranslatedText(text)) {
    return text;
  }
  if (!snapshot?.ready) {
    return text.key;
  }
  return (snapshot.t as (key: string) => string)(text.key);
}
