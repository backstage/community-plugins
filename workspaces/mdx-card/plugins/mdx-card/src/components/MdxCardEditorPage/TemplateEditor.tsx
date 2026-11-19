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
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAsync from 'react-use/esm/useAsync';
import useDebounce from 'react-use/esm/useDebounce';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  CodeSnippet,
  Content,
  ContentHeader,
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';
import type { Entity } from '@backstage/catalog-model';
import {
  DataFetcher,
  MDX_CARD_TEMPLATE_ID_PATTERN,
  mdxCardTemplateCreatePermission,
  mdxCardTemplateDeletePermission,
  mdxCardTemplateUpdatePermission,
} from '@backstage-community/plugin-mdx-card-common';
import { mdxCardApiRef } from '../../api';
import { MdxCardContent } from '../MdxCardContent';
import { DataFetchersEditor } from './DataFetchersEditor';
import { EntityPreviewPicker } from './EntityPreviewPicker';

const DEFAULT_TEMPLATE = `## Hello {props.user.displayName}

Edit this template and the preview updates as you type.
`;

type FormState = {
  id: string;
  title: string;
  template: string;
  dataFetchers: DataFetcher[];
};

const editorExtensions = [
  markdown({ extensions: { remove: ['IndentedCode'] } }),
  EditorView.lineWrapping,
];

const isComplete = (fetcher: DataFetcher) =>
  Boolean(fetcher.name && fetcher.pluginId && fetcher.apiUrl);

const usesEntity = ({ template, dataFetchers }: FormState) =>
  /\bprops\.entity\b/.test(template) ||
  dataFetchers.some(fetcher => /\bentity\./.test(fetcher.apiUrl));

const usageSnippet = (id: string) => `app:
  extensions:
    - entity-card:mdx-card:
        config:
          templateRef: ${id}`;

const TemplateEditorForm = ({
  initial,
  isNew,
}: {
  initial: FormState;
  isNew: boolean;
}) => {
  const mdxCardApi = useApi(mdxCardApiRef);
  const alertApi = useApi(alertApiRef);
  const navigate = useNavigate();
  const theme = useTheme();
  const [form, setForm] = useState(initial);
  const [preview, setPreview] = useState(initial);
  const [entity, setEntity] = useState<Entity>();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useDebounce(() => setPreview(form), 500, [form]);

  const { allowed: canSave } = usePermission({
    permission: isNew
      ? mdxCardTemplateCreatePermission
      : mdxCardTemplateUpdatePermission,
  });
  const { allowed: canDelete } = usePermission({
    permission: mdxCardTemplateDeletePermission,
  });

  const idError =
    isNew && !MDX_CARD_TEMPLATE_ID_PATTERN.test(form.id)
      ? 'Use lowercase letters, numbers and single dashes'
      : undefined;

  const save = async () => {
    setSaving(true);
    const input = {
      title: form.title || undefined,
      template: form.template,
      dataFetchers: form.dataFetchers,
    };
    try {
      if (isNew) {
        await mdxCardApi.createTemplate(form.id, input);
        navigate(`../edit/${form.id}`, { replace: true });
      } else {
        await mdxCardApi.updateTemplate(form.id, input);
      }
      alertApi.post({
        message: `Saved MDX card "${form.id}"`,
        severity: 'success',
        display: 'transient',
      });
    } catch (e) {
      alertApi.post({
        message: `Failed to save MDX card: ${
          e instanceof Error ? e.message : String(e)
        }`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    try {
      await mdxCardApi.deleteTemplate(form.id);
      navigate('..');
    } catch (e) {
      alertApi.post({
        message: `Failed to delete MDX card: ${
          e instanceof Error ? e.message : String(e)
        }`,
        severity: 'error',
      });
    }
  };

  return (
    <Content>
      <ContentHeader title={isNew ? 'New MDX card' : form.id}>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => navigate('..')}>Back</Button>
          {!isNew && (
            <Button
              color="error"
              disabled={!canDelete}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          )}
          <Button
            variant="contained"
            disabled={!canSave || saving || Boolean(idError)}
            onClick={save}
          >
            Save
          </Button>
        </Stack>
      </ContentHeader>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Stack spacing={2}>
            {isNew && (
              <TextField
                label="ID"
                required
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value })}
                error={Boolean(form.id && idError)}
                helperText={
                  (form.id && idError) ||
                  'Cards reference the template by this ID. It cannot be changed later.'
                }
              />
            )}
            <TextField
              label="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <DataFetchersEditor
              value={form.dataFetchers}
              onChange={dataFetchers => setForm({ ...form, dataFetchers })}
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Template
              </Typography>
              <CodeMirror
                value={form.template}
                height="480px"
                theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                extensions={editorExtensions}
                onChange={template => setForm({ ...form, template })}
              />
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack spacing={2}>
            <EntityPreviewPicker onChange={setEntity} />
            <InfoCard title={preview.title || 'Preview'}>
              {usesEntity(preview) && !entity ? (
                <Typography color="text.secondary">
                  This template uses an entity. Pick one above to preview it.
                </Typography>
              ) : (
                <MdxCardContent
                  template={preview.template}
                  dataFetchers={preview.dataFetchers.filter(isComplete)}
                  entity={entity}
                />
              )}
            </InfoCard>
            {!isNew && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Use this card
                </Typography>
                <CodeSnippet
                  language="yaml"
                  text={usageSnippet(form.id)}
                  showCopyCodeButton
                />
              </Box>
            )}
          </Stack>
        </Grid>
      </Grid>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete MDX card "{form.id}"?</DialogTitle>
        <DialogContent>
          Cards that reference this template will stop rendering.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" onClick={remove}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Content>
  );
};

export const TemplateEditor = () => {
  const { id } = useParams();
  const mdxCardApi = useApi(mdxCardApiRef);
  const { value, loading, error } = useAsync(
    async () => (id ? mdxCardApi.getTemplate(id) : undefined),
    [id, mdxCardApi],
  );

  if (loading) {
    return <Progress />;
  }
  if (error) {
    return (
      <Content>
        <ResponseErrorPanel error={error} />
      </Content>
    );
  }

  const initial: FormState = value
    ? {
        id: value.id,
        title: value.title ?? '',
        template: value.template,
        dataFetchers: value.dataFetchers,
      }
    : { id: '', title: '', template: DEFAULT_TEMPLATE, dataFetchers: [] };

  return (
    <TemplateEditorForm key={id ?? 'new'} initial={initial} isNew={!value} />
  );
};
