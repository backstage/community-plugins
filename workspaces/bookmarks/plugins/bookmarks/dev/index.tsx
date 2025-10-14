import { createDevApp } from '@backstage/dev-utils';
import { bookmarksPlugin } from '../src/plugin';
import { PluginTestPage } from './PluginTestPage/PluginTestPage';
import { bookmarksTranslations } from '../src';
import { AVAILABLE_LANGUAGES } from '../src/translations/translations';

import '@backstage/ui/css/styles.css';

createDevApp()
  .registerPlugin(bookmarksPlugin)
  .addTranslationResource(bookmarksTranslations)
  .setAvailableLanguages(AVAILABLE_LANGUAGES)
  .addPage({
    element: <PluginTestPage />,
    title: 'Root Page',
    path: '/bookmarks',
  })
  .render();
