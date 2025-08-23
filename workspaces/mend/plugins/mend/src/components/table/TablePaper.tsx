import type { ReactNode, CSSProperties, FC } from 'react';
import { Grid, Paper } from '@material-ui/core';

type TablePaperProps = {
  children: ReactNode[];
  style: CSSProperties;
};

export const TablePaper: FC<TablePaperProps> = ({ children, style }) => {
  return (
    <Grid direction="column" xs={12}>
      {[
        children[1],
        <Paper elevation={3} style={{ ...style, marginTop: '50px' }}>
          {[children[2], children[3], children[5]]}
        </Paper>,
      ]}
    </Grid>
  );
};
