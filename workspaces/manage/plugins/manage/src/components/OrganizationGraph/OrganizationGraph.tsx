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
import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { makeStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import {
  Direction,
  EntityNode,
  EntityRelationsGraph,
} from '@backstage/plugin-catalog-graph';
import { getCompoundEntityRef, parseEntityRef } from '@backstage/catalog-model';
import { EmptyState } from '@backstage/core-components';
import { useAnalytics, useRouteRef } from '@backstage/core-plugin-api';
import {
  entityRouteRef,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import {
  useOwners,
  usePosition,
} from '@backstage-community/plugin-manage-react';

const useStyles = makeStyles(theme => ({
  controlsCard: {
    position: 'absolute',
    backgroundColor: `rgba(from ${theme.palette.background.paper} r g b / 0.8)`,
  },
  controlsCardContent: {
    padding: `${theme.spacing(2)} !important`,
  },
  label: {
    userSelect: 'none',
  },
}));

/**
 * Props for {@link OrganizationGraph}.
 * @public
 */
export interface OrganizationGraphProps {
  /**
   * Whether to enable the whole organization view. Defaults to true.
   */
  enableWholeOrganization?: boolean;
}

/**
 * An organization view for the current user.
 *
 * @public
 */
export function OrganizationGraphImpl({
  enableWholeOrganization = true,
}: OrganizationGraphProps) {
  const { label, controlsCard, controlsCardContent } = useStyles();
  const [wholeOrg, setWholeOrg] = useState(false);
  const [leftRight, setLeftRight] = useState(false);

  const [graphElement, setGraphElement] = useState<Element | undefined>(
    undefined,
  );
  const graphElementSize = usePosition(graphElement);

  const { ownedEntityRefs } = useOwners();

  const userEntityRef = useMemo(() => {
    return ownedEntityRefs
      .map(entityRef => parseEntityRef(entityRef))
      .find(
        compoundEntityRef =>
          compoundEntityRef.kind.toLocaleLowerCase('en-US') === 'user',
      );
  }, [ownedEntityRefs]);

  const navigate = useNavigate();
  const analytics = useAnalytics();
  const catalogEntityRoute = useRouteRef(entityRouteRef);

  const onNodeClick = useCallback(
    (node: EntityNode) => {
      const entity = node.entity
        ? getCompoundEntityRef(node.entity)
        : parseEntityRef(node.id);

      const path = catalogEntityRoute({
        kind: entity.kind.toLocaleLowerCase('en-US'),
        namespace: entity.namespace.toLocaleLowerCase('en-US'),
        name: entity.name,
      });
      analytics.captureEvent(
        'click',
        node.entity.metadata.title ?? humanizeEntityRef(entity),
        { attributes: { to: path } },
      );
      navigate(path);
    },
    [catalogEntityRoute, navigate, analytics],
  );

  const setRef = useCallback((el: Element | null) => {
    setGraphElement(el ?? undefined);
  }, []);

  const availHeight = useMemo(
    () =>
      !graphElementSize
        ? 400
        : graphElementSize.client.height - graphElementSize.element.top - 64,
    [graphElementSize],
  );

  const renderLabel = useCallback(() => null, []);

  if (!userEntityRef) {
    return <EmptyState title="Current user not found" missing="data" />;
  }

  return (
    <div
      ref={setRef}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        minHeight: availHeight,
        maxHeight: availHeight,
      }}
    >
      <EntityRelationsGraph
        rootEntityNames={userEntityRef}
        kinds={['Group']}
        curve="curveMonotoneX"
        direction={leftRight ? Direction.LEFT_RIGHT : Direction.TOP_BOTTOM}
        mergeRelations
        maxDepth={Infinity}
        unidirectional
        relations={
          wholeOrg
            ? ['parentOf', 'childOf', 'memberOf']
            : ['childOf', 'memberOf']
        }
        onNodeClick={onNodeClick}
        showArrowHeads
        renderLabel={renderLabel}
        zoom="enabled"
      />
      <Card className={controlsCard}>
        <CardContent className={controlsCardContent}>
          <FormGroup row={false}>
            {enableWholeOrganization && (
              <FormControlLabel
                control={
                  <Switch
                    checked={wholeOrg}
                    onChange={(_, checked) => setWholeOrg(checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography className={label}>Whole organization</Typography>
                }
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={leftRight}
                  onChange={(_, checked) => setLeftRight(checked)}
                  color="primary"
                />
              }
              label={<Typography className={label}>Left to right</Typography>}
            />
          </FormGroup>
        </CardContent>
      </Card>
    </div>
  );
}
