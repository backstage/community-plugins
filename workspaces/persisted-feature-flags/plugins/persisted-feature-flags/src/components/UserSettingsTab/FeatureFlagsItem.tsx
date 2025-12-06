/*
 * Copyright 2020 The Backstage Authors
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

import { useCallback } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { useHandleFeatureFlag } from '@backstage-community/plugin-persisted-feature-flags-react';
import { userSettingsTranslationRef } from '@backstage/plugin-user-settings/alpha';
import { AnyFeatureFlag } from './types';

type Props = {
  flag: AnyFeatureFlag;
  enabled: boolean;
  initialEnabled: boolean;
  toggleHandler: Function;
};

const getSecondaryText = (
  flag: AnyFeatureFlag,
  t: TranslationFunction<typeof userSettingsTranslationRef.T>,
) => {
  const pluginText = (
    <Typography variant="caption" color="textSecondary">
      {flag.pluginId
        ? t('featureFlags.flagItem.subtitle.registeredInPlugin', {
            pluginId: flag.pluginId,
          })
        : t('featureFlags.flagItem.subtitle.registeredInApplication')}
    </Typography>
  );

  if (flag.description) {
    return (
      <>
        <Typography variant="body2" color="textSecondary">
          {flag.description}
        </Typography>
        {pluginText}
      </>
    );
  }

  return pluginText;
};

const FlagItemLocal = ({ flag, enabled, toggleHandler }: Props) => {
  const { t } = useTranslationRef(userSettingsTranslationRef);

  return (
    <ListItem divider button onClick={() => toggleHandler(flag.name)}>
      <ListItemIcon>
        <Tooltip
          placement="top"
          arrow
          title={
            enabled
              ? t('featureFlags.flagItem.title.disable')
              : t('featureFlags.flagItem.title.enable')
          }
        >
          <Switch color="primary" checked={enabled} name={flag.name} />
        </Tooltip>
      </ListItemIcon>
      <ListItemText primary={flag.name} secondary={getSecondaryText(flag, t)} />
    </ListItem>
  );
};

const FlagItemPersisted = ({ flag, initialEnabled }: Props) => {
  const { t } = useTranslationRef(userSettingsTranslationRef);

  const [remoteEnabled, setFlag, presence] = useHandleFeatureFlag(flag.name);

  const enabled = !presence ? initialEnabled : remoteEnabled;

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setFlag(!enabled);
    },
    [setFlag, enabled],
  );

  return (
    <ListItem divider button onClick={onClick}>
      <ListItemIcon>
        <Tooltip
          placement="top"
          arrow
          title={
            enabled
              ? t('featureFlags.flagItem.title.disable')
              : t('featureFlags.flagItem.title.enable')
          }
        >
          <Switch color="primary" checked={enabled} name={flag.name} />
        </Tooltip>
      </ListItemIcon>
      <ListItemText primary={flag.name} secondary={getSecondaryText(flag, t)} />
    </ListItem>
  );
};

export const FlagItem = (props: Props) => {
  const { flag } = props;

  return flag.persisted ? (
    <FlagItemPersisted {...props} />
  ) : (
    <FlagItemLocal {...props} />
  );
};
