/*
 * Copyright 2024 The Backstage Authors
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
  createSignInResolverFactory,
  SignInInfo,
  OAuthAuthenticatorResult,
  PassportProfile,
} from '@backstage/plugin-auth-node';
import { issueToken } from './issueToken';

declare module 'passport' {
  interface Profile {
    profileUrl: string;
  }
}

export const customGithubSignInResolver = createSignInResolverFactory({
  create() {
    return async (
      info: SignInInfo<OAuthAuthenticatorResult<PassportProfile>>,
      ctx,
    ) => {
      const {
        result: { fullProfile },
      } = info;

      return issueToken(
        ctx,
        fullProfile.username ?? fullProfile.id,
        new URL(fullProfile.profileUrl).hostname,
      );
    };
  },
});
