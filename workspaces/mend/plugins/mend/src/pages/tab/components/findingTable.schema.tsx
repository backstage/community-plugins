import type { CSSProperties, ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import { dateTimeFormat, getObjValue } from '../../../utils';
import {
  Tag,
  TagColor,
  Tooltip,
  type TableRowFindingProps,
} from '../../../components';
import { StatisticsName, FindingIssueStatus } from '../../../models';
import { FindingTableIssueTrackingTooltip } from './FindingTableIssueTrackingTooltip';

enum FINDING_FIELD {
  SEVERITY = 'level',
  FINDINGS = 'name',
  ORIGIN = 'origin',
  DETECTION_DATE = 'time',
  STATUS = 'issue.status',
  ISSUE_TRACKING = 'issue.issueStatus',
  SCAN_ENGINE = 'kind',
  PROJECT_NAME = 'projectName',
}

const tagSeverityColorMap: { [key: string]: TagColor } = {
  [StatisticsName.CRITICAL]: TagColor.CRITICAL,
  [StatisticsName.HIGH]: TagColor.HIGH,
  [StatisticsName.MEDIUM]: TagColor.MEDIUM,
  [StatisticsName.LOW]: TagColor.LOW,
};

const tagSeverityNameMap: { [key: string]: string } = {
  [StatisticsName.CRITICAL]: 'Critical',
  [StatisticsName.HIGH]: 'High',
  [StatisticsName.MEDIUM]: 'Medium',
  [StatisticsName.LOW]: 'Low',
};

const tagEngineNameMap: { [key: string]: string } = {
  code: 'Code',
  dependencies: 'Dependencies',
  containers: 'Containers',
};

const tagEngineColorMap: { [key: string]: TagColor } = {
  code: TagColor.CODE,
  dependencies: TagColor.DEPENDENCIES,
  containers: TagColor.CONTAINERS,
};

const classes: Record<string, CSSProperties> = {
  ellipsis: {
    maxWidth: 200, // percentage also works
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    width: 'inherit',
  },
  ellipsisrtl: {
    direction: 'rtl',
  },
  title: {
    textTransform: 'none',
    fontWeight: 500,
  },
  date: {
    minWidth: 150,
  },
  empty: {
    borderBottom: '1px solid black',
    borderBottomColor: '#C4C6CB',
    width: 20,
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

const findingColumn = [
  {
    title: 'Project Name',
    field: FINDING_FIELD.PROJECT_NAME,
    ...textColumn,
  },
  {
    title: 'Severity',
    field: FINDING_FIELD.SEVERITY,
    ...textColumn,
  },
  {
    title: 'Finding',
    field: FINDING_FIELD.FINDINGS,
    ...textColumn,
  },
  {
    title: 'Origin',
    field: FINDING_FIELD.ORIGIN,
    ...textColumn,
  },
  {
    title: 'Detection Date',
    field: FINDING_FIELD.DETECTION_DATE,
    ...textColumn,
  },
  {
    title: 'Status',
    field: FINDING_FIELD.STATUS,
    ...textColumn,
  },
  {
    title: 'Issue Tracking',
    field: FINDING_FIELD.ISSUE_TRACKING,
    ...textColumn,
  },
  {
    title: 'Scan Engine',
    field: FINDING_FIELD.SCAN_ENGINE,
    ...textColumn,
  },
];

const issueStatusLabel = {
  [FindingIssueStatus.CREATED]: 'Issue Created',
  [FindingIssueStatus.UNREVIEWED]: 'Unreviewed',
  [FindingIssueStatus.SUPPRESSED]: 'Suppressed',
  [FindingIssueStatus.REVIEWED]: 'Reviewed',
};

const issueStatusColor = {
  [FindingIssueStatus.CREATED]: TagColor.ACTIVE,
  [FindingIssueStatus.UNREVIEWED]: TagColor.NEUTRAL,
  [FindingIssueStatus.SUPPRESSED]: TagColor.SUCCESS,
  [FindingIssueStatus.REVIEWED]: TagColor.HIGH,
};

export const findingTableColumnSchema = findingColumn.map(rowData => {
  return {
    title: (
      <Typography style={classes.title} variant="subtitle2" color="textPrimary">
        {rowData.title}
      </Typography>
    ),
    field: rowData.field,
    width: rowData.width,
    headerStyle: rowData.headerStyle,
    cellStyle: rowData.cellStyle,
    render: (row: TableRowFindingProps): ReactNode => {
      const value = getObjValue(row, rowData.field) as string | number;
      switch (rowData.field) {
        case FINDING_FIELD.SEVERITY: {
          return (
            <Tag
              label={tagSeverityNameMap[row.level]}
              color={tagSeverityColorMap[row.level]}
              shapeVariant="square"
              width="80px"
            />
          );
        }
        case FINDING_FIELD.DETECTION_DATE: {
          return (
            <Typography variant="body2" style={classes.data}>
              {dateTimeFormat(value)}
            </Typography>
          );
        }
        case FINDING_FIELD.STATUS: {
          return (
            <Tooltip
              isAlwaysVisible={false}
              tooltipContent={
                <Tag
                  label={issueStatusLabel[row.issue.status]}
                  color={issueStatusColor[row.issue.status]}
                  width="auto"
                />
              }
            >
              <Tag
                label={issueStatusLabel[row.issue.status]}
                color={issueStatusColor[row.issue.status]}
                width="110px"
              />
            </Tooltip>
          );
        }
        case FINDING_FIELD.ISSUE_TRACKING: {
          if (row.issue.issueStatus) {
            return (
              <FindingTableIssueTrackingTooltip
                reporter={row.issue.reporter}
                creationDate={row.issue?.creationDate}
                ticketName={row.issue?.ticketName}
                link={row.issue?.link}
                issue={row.name}
                issueStatus={row.issue.issueStatus}
              />
            );
          }
          return <div style={classes.empty} />;
        }
        case FINDING_FIELD.SCAN_ENGINE: {
          return (
            <Tag
              label={tagEngineNameMap[row.kind]}
              color={tagEngineColorMap[row.kind]}
              width="auto"
              fontWeight={500}
            />
          );
        }
        case FINDING_FIELD.PROJECT_NAME: {
          return (
            <Tooltip
              tooltipContent={
                <Typography
                  component="span"
                  display="block"
                  style={{
                    textTransform: 'none',
                    lineHeight: '16px',
                    padding: '8px',
                  }}
                  align="center"
                  variant="overline"
                >
                  {value}
                </Typography>
              }
            >
              <Typography
                component="span"
                style={classes.ellipsis}
                variant="body2"
              >
                {value}
              </Typography>
            </Tooltip>
          );
        }
        case FINDING_FIELD.ORIGIN: {
          return (
            <Tooltip
              tooltipContent={
                <Typography
                  component="span"
                  display="block"
                  style={{
                    textTransform: 'none',
                    lineHeight: '16px',
                    padding: '8px',
                  }}
                  align="center"
                  variant="overline"
                >
                  {value}
                </Typography>
              }
            >
              <Typography
                component="span"
                style={{ ...classes.ellipsis, ...classes.ellipsisrtl }}
                variant="body2"
              >
                {value}
              </Typography>
            </Tooltip>
          );
        }
        default: {
          return (
            <Tooltip
              tooltipContent={
                <Typography
                  component="span"
                  display="block"
                  style={{
                    textTransform: 'none',
                    lineHeight: '16px',
                    padding: '8px',
                  }}
                  align="center"
                  variant="overline"
                >
                  {value}
                </Typography>
              }
            >
              <Typography
                component="span"
                style={classes.ellipsis}
                variant="body2"
              >
                {value}
              </Typography>
            </Tooltip>
          );
        }
      }
    },
  };
});
