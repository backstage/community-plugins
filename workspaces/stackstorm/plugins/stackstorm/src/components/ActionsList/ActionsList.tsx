/*
 * Copyright 2023 The Backstage Authors
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
import { useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { Link, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { Button } from '@backstage/ui';
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react';
import { Action, Pack, stackstormApiRef } from '../../api';
import styles from './ActionsList.module.css';

type ActionItemsProps = {
  pack: Pack;
};

export const ActionItems = ({ pack }: ActionItemsProps) => {
  const st2 = useApi(stackstormApiRef);

  const { value, loading, error } = useAsync(async (): Promise<Action[]> => {
    const data = await st2.getActions(pack.ref);
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <div className={styles.actions}>
      {(value || []).map(a => {
        return (
          <Link
            key={a.ref}
            to={st2.getActionUrl(a.ref)}
            className={styles.nestedItem}
            underline="none"
            color="inherit"
          >
            <div className={styles.nestedItemText}>
              <div className={styles.primary}>{a.name}</div>
              <div className={styles.secondary}>{a.description}</div>
            </div>
            <div className={styles.nestedItemSecondary}>{a.runner_type}</div>
          </Link>
        );
      })}
    </div>
  );
};

type PackListItemProps = {
  pack: Pack;
  opened: boolean;
  onClick: (ref: string) => any;
};

export const PackListItem = ({ pack, opened, onClick }: PackListItemProps) => {
  return (
    <>
      <Button
        className={styles.listItemButton}
        onPress={() => onClick(pack.ref)}
        variant="secondary"
      >
        <div className={styles.icon}>
          {opened ? (
            <RiArrowUpSLine size={20} />
          ) : (
            <RiArrowDownSLine size={20} />
          )}
        </div>
        <div className={styles.listItemText}>
          <div className={styles.primary}>{pack.ref}</div>
          <div className={styles.secondary}>{pack.description}</div>
        </div>
        <div className={styles.secondaryAction}>version: {pack.version}</div>
      </Button>
      <div
        className={`${styles.collapseContent} ${
          opened ? styles.collapseContentOpen : styles.collapseContentClosed
        }`}
      >
        {opened && <ActionItems pack={pack} />}
      </div>
    </>
  );
};

export const ActionsList = () => {
  const st2 = useApi(stackstormApiRef);

  const [expanded, setExpanded] = useState<string[]>([]);

  const onClick = (ref: string) => {
    setExpanded(refs =>
      refs.includes(ref) ? refs.filter(r => r !== ref) : refs.concat(ref),
    );
  };

  const { value, loading, error } = useAsync(async (): Promise<Pack[]> => {
    const data = await st2.getPacks();
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <nav className={styles.root}>
      {(value || []).map(p => {
        return (
          <PackListItem
            key={p.ref}
            pack={p}
            opened={expanded.includes(p.ref)}
            onClick={onClick}
          />
        );
      })}
    </nav>
  );
};
