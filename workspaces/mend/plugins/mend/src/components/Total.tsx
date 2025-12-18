import MaterialCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { Statistics } from '../models';
import { numberToShortText } from '../utils';
import { Card } from './Card';
import { StatisticsBar } from './StatisticsBar';

type TotalProps = {
  clientName: string;
  data: Statistics;
  dataLoading: boolean;
  title: string;
  url: string;
};

const useStyles = makeStyles<Theme>(theme => ({
  container: {
    border: '1px solid #dfdfdf',
    boxShadow: '0px 2px 4px 0px #00000026',
  },
  content: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor:
      theme.palette.mode === 'light'
        ? '#F5F6F8'
        : theme.palette.background.default,
  },
  header: {
    justifyContent: 'center',
    padding: '16px',
    '& span': {
      fontWeight: 500,
      fontSize: '20px',
    },
  },
  actions: {
    display: 'flex',
    padding: '16px',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    width: '16px',
    height: '16px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.4rem',
  },
  total: {
    fontWeight: 500,
    fontSize: '63px',
  },
}));

export const Total = ({
  clientName,
  data,
  dataLoading,
  title,
  url,
}: TotalProps) => {
  const classes = useStyles();

  return (
    <MaterialCard className={classes.container}>
      <CardHeader className={classes.header} title={title} />
      <Divider />
      <CardContent className={classes.content}>
        <Grid
          container
          direction="row"
          sx={{
            padding: 2,
            paddingRight: 0,
            flexWrap: { xs: 'wrap', lg: 'nowrap' },
          }}
          gap={2}
        >
          <Grid item lg={2} md={12}>
            <Card title="Total Findings" loading={dataLoading}>
              <Typography
                variant="h1"
                component="span"
                className={classes.total}
              >
                {numberToShortText(data.total)}
              </Typography>
            </Card>
          </Grid>
          <Grid item lg={5} md={12}>
            <Card title="Total Findings by Severity" loading={dataLoading}>
              <StatisticsBar statistics={data} type="default" />
            </Card>
          </Grid>
          <Grid item lg={5} md={12}>
            <Card title="Total Findings by Scan Engine" loading={dataLoading}>
              <StatisticsBar statistics={data} type="engine" />
            </Card>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions className={classes.actions}>
        <Link
          href={url}
          target="_blank"
          rel="noreferrer"
          variant="subtitle1"
          className={classes.link}
        >
          {!dataLoading && (
            <>
              <SvgIcon viewBox="0 0 16 16" className={classes.icon}>
                <path d="M9.1875 0.0488281C8.94687 0.0488281 8.75 0.245703 8.75 0.486328C8.75 0.726953 8.94687 0.923828 9.1875 0.923828L12.507 0.923828L5.81602 7.61484C5.64648 7.78438 5.64648 8.06328 5.81602 8.23281C5.98555 8.40234 6.26445 8.40234 6.43398 8.23281L13.125 1.5418V4.86133C13.125 5.10195 13.3219 5.29883 13.5625 5.29883C13.8031 5.29883 14 5.10195 14 4.86133V0.486328C14 0.245703 13.8031 0.0488281 13.5625 0.0488281L9.1875 0.0488281ZM1.75 1.79883C0.784766 1.79883 0 2.58359 0 3.54883L0 12.2988C0 13.2641 0.784766 14.0488 1.75 14.0488L10.5 14.0488C11.4652 14.0488 12.25 13.2641 12.25 12.2988V8.36133C12.25 8.1207 12.0531 7.92383 11.8125 7.92383C11.5719 7.92383 11.375 8.1207 11.375 8.36133V12.2988C11.375 12.7828 10.984 13.1738 10.5 13.1738L1.75 13.1738C1.26602 13.1738 0.875 12.7828 0.875 12.2988L0.875 3.54883C0.875 3.06484 1.26602 2.67383 1.75 2.67383L5.6875 2.67383C5.92812 2.67383 6.125 2.47695 6.125 2.23633C6.125 1.9957 5.92812 1.79883 5.6875 1.79883L1.75 1.79883Z" />
              </SvgIcon>
              Go to Organization “{clientName}” in the Mend.io Platform
            </>
          )}
        </Link>
      </CardActions>
    </MaterialCard>
  );
};
