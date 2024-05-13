import { createDevApp } from '@backstage/dev-utils';
import { linkerdPlugin } from '../src/plugin';

createDevApp().registerPlugin(linkerdPlugin).render();
