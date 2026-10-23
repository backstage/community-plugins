/*
 * Copyright 2026 The Backstage Authors
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
import { useApi, useTranslationRef } from '@backstage/frontend-plugin-api';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Container,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Flex,
  Header,
  Text,
} from '@backstage/ui';
import {
  GuidedTour,
  GuidedTourProgress,
  guidedTourApiRef,
} from '@backstage-community/plugin-guided-tours-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeForStep } from '../overlay/isOnRoute';
import { useGuidedTourSnapshot } from '../overlay/useGuidedTourSnapshot';
import { guidedTourTranslationRef } from '../../translation';

type StatusKey = 'new' | 'inProgress' | 'completed' | 'dismissed';

function statusOf(progress: GuidedTourProgress | undefined): StatusKey {
  if (!progress) return 'new';
  if (progress.status === 'in-progress') return 'inProgress';
  return progress.status;
}

function TourRow(props: { tour: GuidedTour; progress?: GuidedTourProgress }) {
  const { tour, progress } = props;
  const api = useApi(guidedTourApiRef);
  const navigate = useNavigate();
  const { t } = useTranslationRef(guidedTourTranslationRef);
  const status = statusOf(progress);

  const onStart = () => {
    const resume = status === 'inProgress';
    const stepIndex = resume ? progress?.stepIndex ?? 0 : 0;
    // the page the step is on, even if an earlier step set the route
    const route = routeForStep(tour.steps, stepIndex);
    if (route) {
      navigate(route);
    }
    api.start(tour.id, { force: !resume });
  };

  const label = {
    new: t('page.start'),
    inProgress: t('page.continue'),
    completed: t('page.restart'),
    dismissed: t('page.restart'),
  }[status];

  return (
    <Card>
      <CardBody>
        <Flex
          justify="between"
          align="center"
          gap="4"
          data-guided-tour={`guided-tours.row.${tour.id}`}
        >
          <Flex direction="column" gap="1">
            <Flex align="center" gap="2">
              <Text variant="title-x-small" as="h3">
                {tour.title}
              </Text>
              <Badge size="small">{t(`page.status.${status}`)}</Badge>
            </Flex>
            {tour.description && (
              <Text color="secondary">{tour.description}</Text>
            )}
            <Text variant="body-x-small" color="secondary">
              {t('page.steps', { n: String(tour.steps.length) })}
              {tour.autoStart === 'login' && ` · ${t('page.autoStartLogin')}`}
              {typeof tour.autoStart === 'object' &&
                tour.autoStart !== null &&
                ` · ${t('page.autoStartRoute', {
                  route: tour.autoStart.route,
                })}`}
            </Text>
          </Flex>
          <Button
            variant={
              status === 'completed' || status === 'dismissed'
                ? 'secondary'
                : 'primary'
            }
            onPress={onStart}
          >
            {label}
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
}

export function GuidedToursPage() {
  const api = useApi(guidedTourApiRef);
  const snapshot = useGuidedTourSnapshot();
  const { t } = useTranslationRef(guidedTourTranslationRef);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const tours = api.getTours();

  return (
    <>
      <Header
        title={t('page.title')}
        description={t('page.description')}
        customActions={
          <Button
            variant="secondary"
            onPress={() => setConfirmOpen(true)}
            isDisabled={tours.length === 0}
          >
            {t('page.resetAll')}
          </Button>
        }
      />
      <Container>
        <Flex direction="column" gap="3" data-guided-tour="guided-tours.list">
          {tours.length === 0 && (
            <Text color="secondary">{t('page.empty')}</Text>
          )}
          {tours.map(tour => (
            <TourRow
              key={tour.id}
              tour={tour}
              progress={api.getProgress(tour.id)}
            />
          ))}
        </Flex>
      </Container>
      <Dialog isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogHeader>{t('page.resetAllTitle')}</DialogHeader>
        <DialogBody>
          <Text>{t('page.resetAllBody')}</Text>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onPress={() => setConfirmOpen(false)}>
            {t('page.cancel')}
          </Button>
          <Button
            variant="primary"
            destructive
            onPress={async () => {
              await api.resetAllProgress();
              setConfirmOpen(false);
            }}
          >
            {t('page.confirm')}
          </Button>
        </DialogFooter>
      </Dialog>
      {/* keep the page re-rendering on progress changes */}
      <span hidden>{Object.keys(snapshot.progress).length}</span>
    </>
  );
}
