import { createDevApp } from '@backstage/dev-utils';
import { grafanaPlugin } from '../src/plugin';

createDevApp().registerPlugin(grafanaPlugin).render();
