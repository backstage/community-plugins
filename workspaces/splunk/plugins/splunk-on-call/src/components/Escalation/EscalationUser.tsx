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

import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import EmailIcon from '@material-ui/icons/Email';
import { User } from '../types';

const useStyles = makeStyles({
  listItemPrimary: {
    fontWeight: 'bold',
  },
});

type Props = {
  user: User;
};

export const EscalationUser = ({ user }: Props) => {
  const classes = useStyles();

  return (
    <ListItem>
      <ListItemIcon>
        <Avatar alt="User" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography className={classes.listItemPrimary}>
            {user.firstName} {user.lastName}
          </Typography>
        }
        secondary={user.email}
      />
      <ListItemSecondaryAction>
        <Tooltip title="Send e-mail to user" placement="top">
          <IconButton href={`mailto:${user.email}`}>
            <EmailIcon color="primary" />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
