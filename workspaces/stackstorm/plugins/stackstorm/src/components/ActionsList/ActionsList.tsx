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
import { Text } from '@backstage/ui';
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
    <ul className={styles.actions}>
      {(value || []).map(a => (
        <li key={a.ref}>
          <Link to={st2.getActionUrl(a.ref)} className={styles.actionLink}>
            <span className={styles.textContent}>
              <Text>{a.name}</Text>
              <Text variant="body-small" color="secondary">
                {a.description}
              </Text>
            </span>
            <span className={styles.secondaryAction}>{a.runner_type}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

type PackListItemProps = {
  pack: Pack;
  opened: boolean;
  onClick: (ref: string) => any;
};

export const PackListItem = ({ pack, opened, onClick }: PackListItemProps) => {
  return (
    <li>
      <button
        type="button"
        className={styles.packButton}
        aria-expanded={opened}
        onClick={() => onClick(pack.ref)}
      >
        <span className={styles.icon}>
          {opened ? (
            <RiArrowUpSLine size={20} />
          ) : (
            <RiArrowDownSLine size={20} />
          )}
        </span>
        <span className={styles.textContent}>
          <Text>{pack.ref}</Text>
          <Text variant="body-small" color="secondary">
            {pack.description}
          </Text>
        </span>
        <span className={styles.secondaryAction}>version: {pack.version}</span>
      </button>
      {opened && <ActionItems pack={pack} />}
    </li>
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
    <ul className={styles.root} role="navigation" aria-label="Actions by pack">
      {(value || []).map(p => (
        <PackListItem
          key={p.ref}
          pack={p}
          opened={expanded.includes(p.ref)}
          onClick={onClick}
        />
      ))}
    </ul>
  );
};
