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
  CodeSnippet,
  InfoCard,
  Link,
  WarningPanel,
} from '@backstage/core-components';
import HelpRounded from '@material-ui/icons/HelpRounded';
import { KialiChecker } from '../../store/KialiProvider';

export const KialiHelper = (props: { check: KialiChecker }) => {
  const pretty = () => {
    if (props.check.message) {
      const helper = props.check.helper;
      const attributes =
        props.check.missingAttributes &&
        `Missing attributes: ${props.check.missingAttributes.join(',')}.`;
      return (
        <>
          <InfoCard>
            <CodeSnippet text={props.check.message} language="bash" />
          </InfoCard>
          {attributes && (
            <>
              <br /> {attributes}
            </>
          )}
          {helper && (
            <>
              <br /> <HelpRounded />
              {helper}
            </>
          )}
        </>
      );
    }
    return <></>;
  };

  const printAuthentication = (
    <>
      The authentication provided by Kiali is{' '}
      <b>{props.check.authData?.strategy}</b>. <br />
      You need to install the kiali backend to be able to use this kiali.
      <br /> Follow the steps in{' '}
      <Link to="https://github.com/backstage/community-plugins/blob/main/workspaces/kiali/README.md">
        Kiali Plugin
      </Link>
      {pretty()}
    </>
  );

  return props.check.verify ? (
    <></>
  ) : (
    <WarningPanel
      data-test={props.check.title || 'Unexpected Check'}
      title={props.check.title || 'Unexpected Check'}
    >
      {props.check.authData ? printAuthentication : pretty()}
    </WarningPanel>
  );
};
