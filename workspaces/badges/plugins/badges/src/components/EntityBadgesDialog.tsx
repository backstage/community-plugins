/*
 * Copyright 2021 The Backstage Authors
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

import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { useTheme } from '@material-ui/core/styles';
import { useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { BadgeStyle, BADGE_STYLES, badgesApiRef } from '../api';

import {
  CodeSnippet,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

export const EntityBadgesDialog = (props: {
  open: boolean;
  onClose?: () => any;
}) => {
  const { open, onClose } = props;
  const theme = useTheme();
  const { entity } = useAsyncEntity();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const badgesApi = useApi(badgesApiRef);

  const [style, setStyle] = useState<BadgeStyle>();

  const {
    value: badges,
    loading,
    error,
  } = useAsync(async () => {
    if (open && entity) {
      return await badgesApi.getEntityBadgeSpecs(entity, { style });
    }
    return [];
  }, [badgesApi, entity, open, style]);

  return (
    <Dialog fullScreen={fullScreen} open={open} onClose={onClose}>
      <DialogTitle>Entity Badges</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Embed badges in other web sites that link back to this entity. Copy
          the relevant snippet of Markdown code to use the badge.
        </DialogContentText>

        <Typography variant="subtitle1">Select Badge Style</Typography>
        <FormControl
          variant="standard"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          <InputLabel id="badge-style-label">Style</InputLabel>
          <Select
            labelId="badge-style-label"
            id="badge-style"
            value={style}
            label="Style"
            onChange={e => setStyle(e.target.value as BadgeStyle)}
          >
            <MenuItem value={undefined}>
              <em>Default</em>
            </MenuItem>
            {BADGE_STYLES.map(s => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && <Progress />}
        {error && <ResponseErrorPanel error={error} />}

        {badges && (
          <>
            <Typography variant="subtitle1">Badge Previews</Typography>
            {badges.map(({ badge: { description }, id, url, markdown }) => (
              <Box marginTop={2} marginBottom={2} key={id}>
                <DialogContentText component="div">
                  <img alt={description || id} src={url} />
                  <CodeSnippet
                    language="markdown"
                    text={markdown}
                    showCopyCodeButton
                  />
                </DialogContentText>
              </Box>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
