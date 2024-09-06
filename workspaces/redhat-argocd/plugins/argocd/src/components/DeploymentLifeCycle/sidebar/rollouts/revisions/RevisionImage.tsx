import React from 'react';

import { Typography } from '@material-ui/core';

import { ReplicaSet } from '../../../../../types/resources';

const RevisionImage = ({ revision }: { revision: ReplicaSet }) => {
  const image = revision.spec?.template?.spec?.containers?.[0]?.image;
  if (!image) {
    return null;
  }

  return (
    <div style={{ maxWidth: '95%' }}>
      <Typography variant="body2" color="textPrimary">
        Traffic to image {image}
      </Typography>
    </div>
  );
};
export default RevisionImage;
