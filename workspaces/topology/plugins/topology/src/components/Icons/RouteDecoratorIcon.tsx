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
import { detectGitType, GitProvider } from '../../utils/git-utils';
import BitbucketIcon from './BitbucketIcon';
import CheIcon from './CheIcon';
import GitAltIcon from './GitAltIcon';
import GithubIcon from './GithubIcon';
import GitlabIcon from './GitlabIcon';

type RouteDecoratorIconProps = {
  routeURL: string;
  radius: number;
  cheEnabled?: boolean;
};

const RouteDecoratorIcon = ({
  routeURL,
  radius,
  cheEnabled,
}: RouteDecoratorIconProps) => {
  if (cheEnabled && routeURL) {
    return <CheIcon style={{ fontSize: radius }} />;
  }
  switch (detectGitType(routeURL)) {
    case GitProvider.INVALID:
      // Not a valid url and thus not safe to use
      return null;
    case GitProvider.GITHUB:
      return (
        <GithubIcon style={{ fontSize: radius }} title="Edit source code" />
      );
    case GitProvider.BITBUCKET:
      return (
        <BitbucketIcon style={{ fontSize: radius }} title="Edit source code" />
      );
    case GitProvider.GITLAB:
      return (
        <GitlabIcon style={{ fontSize: radius }} title="Edit source code" />
      );
    default:
      return (
        <GitAltIcon style={{ fontSize: radius }} title="Edit source code" />
      );
  }
};

export default RouteDecoratorIcon;
