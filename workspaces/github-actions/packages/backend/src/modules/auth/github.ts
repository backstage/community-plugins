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
