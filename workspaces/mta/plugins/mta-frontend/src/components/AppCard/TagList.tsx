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
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import { Tags } from '../../api/api';

const useStyles = makeStyles(theme => ({
  chip: {
    margin: theme.spacing(1),
  },
  gridContainer: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
}));

const TagList = ({ tags }: { tags: Tags[] }) => {
  const classes = useStyles();

  if (!tags || tags.length === 0) {
    return <div>None</div>;
  }

  return (
    <Grid container className={classes.gridContainer} spacing={1}>
      {tags.map((tag, index) => (
        <Grid item key={index}>
          <Tooltip title={`Source: ${tag.source || 'Unknown'}`}>
            <Chip
              label={tag.name}
              clickable
              color="primary"
              className={classes.chip}
            />
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
};

export default TagList;
