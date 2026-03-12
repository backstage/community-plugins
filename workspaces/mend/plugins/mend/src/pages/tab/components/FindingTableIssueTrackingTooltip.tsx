/*
 * Copyright 2025 The Backstage Authors
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
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { Tag, TagColor, Tooltip } from '../../../components';
import { dateTimeFormat } from '../../../utils';

type FindingTableIssueTrackingTooltipProps = {
  reporter: string;
  creationDate: string;
  ticketName: string;
  link: string;
  issue: string;
  issueStatus: string;
};

export const FindingTableIssueTrackingTooltip = ({
  ticketName,
  creationDate,
  reporter,
  link,
  issue,
  issueStatus,
}: FindingTableIssueTrackingTooltipProps) => {
  return (
    <Tooltip
      isAlwaysVisible
      tooltipContent={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '8px',
            lineHeight: '16px',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '12px',
              lineHeight: '16px',
            }}
          >
            Issue Tracking Status
          </Typography>
          <Typography
            sx={{
              lineHeight: '16px',
              fontSize: '12px',
              fontWeight: 400,
            }}
          >{`"${issue}"`}</Typography>
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              padding: '8px',
              color: 'white',
              borderRadius: '4px',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                columnGap: '8px',
                rowGap: '4px',
              }}
            >
              <p
                style={{
                  display: 'flex',
                  gap: '4px',
                  flexDirection: 'column',
                  width: '50%',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Ticket #
                </Typography>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <a
                    style={{
                      textDecoration: 'underline',
                      width: 'auto',
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={link}
                  >
                    {ticketName}
                  </a>
                  <SvgIcon viewBox="0 0 12 11" style={{ height: '16px' }}>
                    <path
                      d="M7.64062 0.25C7.46016 0.25 7.3125 0.397656 7.3125 0.578125C7.3125 0.758594 7.46016 0.90625 7.64062 0.90625H10.1303L5.11201 5.92451C4.98486 6.05166 4.98486 6.26084 5.11201 6.38799C5.23916 6.51514 5.44834 6.51514 5.57549 6.38799L10.5938 1.36973V3.85938C10.5938 4.03984 10.7414 4.1875 10.9219 4.1875C11.1023 4.1875 11.25 4.03984 11.25 3.85938V0.578125C11.25 0.397656 11.1023 0.25 10.9219 0.25H7.64062ZM2.0625 1.5625C1.33857 1.5625 0.75 2.15107 0.75 2.875V9.4375C0.75 10.1614 1.33857 10.75 2.0625 10.75H8.625C9.34893 10.75 9.9375 10.1614 9.9375 9.4375V6.48438C9.9375 6.30391 9.78984 6.15625 9.60938 6.15625C9.42891 6.15625 9.28125 6.30391 9.28125 6.48438V9.4375C9.28125 9.80049 8.98799 10.0938 8.625 10.0938H2.0625C1.69951 10.0938 1.40625 9.80049 1.40625 9.4375V2.875C1.40625 2.51201 1.69951 2.21875 2.0625 2.21875H5.01562C5.19609 2.21875 5.34375 2.07109 5.34375 1.89062C5.34375 1.71016 5.19609 1.5625 5.01562 1.5625H2.0625Z"
                      fill="white"
                    />
                  </SvgIcon>
                </Typography>
              </p>
              <p
                style={{
                  display: 'flex',
                  gap: '4px',
                  flexDirection: 'column',
                  width: '50%',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Status
                </Typography>
                <Tag
                  label={issueStatus}
                  color={TagColor.ACTIVE}
                  height="21px"
                  width="fit-content"
                />
              </p>
            </div>
            <Divider
              sx={{
                border: '1px solid white',
                opacity: '0.1',
              }}
            />
            <div
              style={{
                display: 'flex',
                columnGap: '8px',
                rowGap: '4px',
              }}
            >
              <p
                style={{
                  display: 'flex',
                  gap: '4px',
                  flexDirection: 'column',
                  width: '50%',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Creation date
                </Typography>
                <Typography variant="caption">
                  {dateTimeFormat(creationDate)}
                </Typography>
              </p>
              <p
                style={{
                  display: 'flex',
                  gap: '4px',
                  flexDirection: 'column',
                  width: '50%',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '12px',
                    lineHeight: '16px',
                  }}
                >
                  Reporter
                </Typography>
                <Typography variant="caption">{reporter}</Typography>
              </p>
            </div>
          </div>
        </Box>
      }
    >
      <Tag label={issueStatus} color={TagColor.ACTIVE} width="110px" />
    </Tooltip>
  );
};
