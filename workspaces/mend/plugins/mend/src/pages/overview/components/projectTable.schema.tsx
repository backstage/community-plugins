import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Tag, TagColor, type TableRowProjectProps } from '../../../components';
import { dateTimeFormat, getObjValue } from '../../../utils';
import { ProjectTableLanguages } from './ProjectTableLanguages';

enum PROJECT_FIELD {
  NAME = 'name',
  APPLICATION_NAME = 'applicationName',
  STATISTICS_TOTAL = 'statistics.total',
  STATISTICS_CRITICAL = 'statistics.critical',
  STATISTICS_HIGH = 'statistics.high',
  STATISTICS_MEDIUM = 'statistics.medium',
  STATISTICS_LOW = 'statistics.low',
  LANGUAGES = 'languages',
  LAST_SCAN = 'lastScan',
}

enum SEVERITY_LEVEL {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export const tagColorMap = {
  [SEVERITY_LEVEL.CRITICAL]: TagColor.CRITICAL,
  [SEVERITY_LEVEL.HIGH]: TagColor.HIGH,
  [SEVERITY_LEVEL.MEDIUM]: TagColor.MEDIUM,
  [SEVERITY_LEVEL.LOW]: TagColor.LOW,
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme?.palette?.mode === 'light' ? '#073C8C' : 'white',
}));

const classes: Record<string, CSSProperties> = {
  ellipsis: {
    maxWidth: 200, // percentage also works
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const textColumn = {
  headerStyle: {
    padding: '12px 20px',
  },
  cellStyle: {
    padding: '12px 20px',
  },
  width: 'auto',
};

const tagColumn = {
  headerStyle: {
    padding: 0,
  },
  cellStyle: {
    padding: 0,
  },
  width: '50px',
  align: 'center',
};

export const projectColumn = [
  {
    title: 'Project',
    field: PROJECT_FIELD.NAME,
    ...textColumn,
  },
  {
    title: 'Application',
    field: PROJECT_FIELD.APPLICATION_NAME,
    ...textColumn,
  },
  {
    title: 'Total Findings',
    field: PROJECT_FIELD.STATISTICS_TOTAL,
    ...textColumn,
  },
  {
    title: SEVERITY_LEVEL.CRITICAL,
    field: PROJECT_FIELD.STATISTICS_CRITICAL,
    ...tagColumn,
  },
  {
    title: SEVERITY_LEVEL.HIGH,
    field: PROJECT_FIELD.STATISTICS_HIGH,
    ...tagColumn,
  },
  {
    title: SEVERITY_LEVEL.MEDIUM,
    field: PROJECT_FIELD.STATISTICS_MEDIUM,
    ...tagColumn,
  },
  {
    title: SEVERITY_LEVEL.LOW,
    field: PROJECT_FIELD.STATISTICS_LOW,
    ...tagColumn,
  },
  {
    title: 'Languages',
    field: PROJECT_FIELD.LANGUAGES,
    headerStyle: {},
    cellStyle: {
      padding: '6px 20px',
      display: 'flex',
      scrollbarWidth: 'none',
      height: '100%',
    } as Record<string, CSSProperties>, // NOTE: scrollbarWidth is not recoginized
    width: '310px',
  },
  {
    title: 'Last Scan',
    field: PROJECT_FIELD.LAST_SCAN,
    ...textColumn,
    width: '200px',
    minWidth: '200px',
  },
];

export const projectTableColumnSchema = projectColumn.map(rowData => {
  const prepareTitle = () => {
    switch (rowData.title) {
      case SEVERITY_LEVEL.CRITICAL:
      case SEVERITY_LEVEL.HIGH:
      case SEVERITY_LEVEL.MEDIUM:
      case SEVERITY_LEVEL.LOW: {
        return (
          <Tag
            label={rowData.title}
            color={tagColorMap[rowData.title]}
            shapeVariant="square"
            width="80px"
          />
        );
      }
      default:
        return (
          <div>
            <Typography
              style={{ textTransform: 'none', fontWeight: 500 }}
              variant="subtitle2"
              color="textPrimary"
            >
              {rowData.title}
            </Typography>
          </div>
        );
    }
  };
  return {
    title: prepareTitle(),
    field: rowData.field,
    width: rowData.width,
    headerStyle: rowData.headerStyle,
    cellStyle: rowData.cellStyle,
    render: (row: TableRowProjectProps): ReactNode => {
      const value = getObjValue(row, rowData.field) as any;
      switch (rowData.field) {
        case PROJECT_FIELD.NAME: {
          const uri = `/${row.entity?.source}/${row.entity?.namespace}/${row.entity?.kind}/${row.entity?.params.repo}/mend?filter=${row.name}`;

          return (
            <Link to={uri}>
              <StyledTypography style={classes.ellipsis} variant="body2">
                {value}
              </StyledTypography>
            </Link>
          );
        }
        case PROJECT_FIELD.LAST_SCAN: {
          return (
            <div style={{ minWidth: 200 }}>
              <Typography variant="body2">{dateTimeFormat(value)}</Typography>
            </div>
          );
        }
        case PROJECT_FIELD.LANGUAGES: {
          return <ProjectTableLanguages items={value} />;
        }
        case PROJECT_FIELD.STATISTICS_CRITICAL:
        case PROJECT_FIELD.STATISTICS_HIGH:
        case PROJECT_FIELD.STATISTICS_MEDIUM:
        case PROJECT_FIELD.STATISTICS_LOW: {
          return <Tag label={value} shapeVariant="square" width="80px" />;
        }
        default: {
          return (
            <Typography
              component="span"
              style={classes.ellipsis}
              variant="body2"
            >
              {value}
            </Typography>
          );
        }
      }
    },
  };
});
