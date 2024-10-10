import React from 'react';
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
