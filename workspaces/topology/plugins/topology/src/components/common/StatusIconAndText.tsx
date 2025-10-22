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

import { ReactElement, cloneElement } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';

import CamelCaseWrap from './CamelCaseWrap';

const DASH = '-';

const useStyles = makeStyles({
  iconAndText: {
    alignItems: 'baseline',
    display: 'flex',
    fontWeight: 400,
    fontSize: '14px',
  },

  flexChild: {
    flex: ' 0 0 auto',
    position: 'relative',
    top: '0.125em',
  },
});

export const StatusIconAndText = ({
  icon,
  title,
  spin,
  iconOnly,
  className,
  dataTestId,
}: {
  title: string;
  iconOnly?: boolean;
  className?: string;
  icon: ReactElement;
  spin?: boolean;
  dataTestId?: string;
}): ReactElement => {
  const styles = useStyles();
  if (!title) {
    return <>{DASH}</>;
  }

  if (iconOnly) {
    return (
      <>
        {cloneElement(icon, {
          'data-testid': dataTestId ?? `icon-only-${title}`,
          className: icon.props.className,
        })}
      </>
    );
  }

  return (
    <Typography
      className={classNames(styles.iconAndText, className)}
      data-testid={dataTestId ?? `icon-with-title-${title}`}
      title={title}
    >
      {cloneElement(icon, {
        className: classNames(
          spin && 'fa-spin',
          icon.props.className,
          styles.flexChild,
        ),
      })}
      <CamelCaseWrap value={title} dataTest="status-text" />
    </Typography>
  );
};

export default StatusIconAndText;
