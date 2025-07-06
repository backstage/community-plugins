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
import { Button } from '@material-ui/core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import { default as React } from 'react';
import { AboutUIModal } from '../../../components/About/AboutUIModal';
import { KialiAppState, KialiContext } from '../../../store';

export const HelpKiali = (props: { color?: string }) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [showAbout, setShowAbout] = React.useState<boolean>(false);

  const openAbout = () => {
    setShowAbout(true);
  };

  return (
    <>
      <Button
        onClick={openAbout}
        style={{ marginTop: '-5px' }}
        data-test="help-button"
      >
        <QuestionCircleIcon color={`${props.color}`} />
      </Button>
      <AboutUIModal
        showModal={showAbout}
        setShowModal={setShowAbout}
        status={kialiState.statusState.status}
        externalServices={kialiState.statusState.externalServices}
        warningMessages={kialiState.statusState.warningMessages}
      />
    </>
  );
};
