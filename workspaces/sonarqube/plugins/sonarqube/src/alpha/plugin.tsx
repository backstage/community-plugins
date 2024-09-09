import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { entitySonarQubeCard } from './entityCard';
import { sonarQubeApi } from './apis';
import { entitySonarQubeContent } from './entityContent';

/**
 * @alpha
 */
export default createFrontendPlugin({
  id: 'sonarqube',
  extensions: [sonarQubeApi, entitySonarQubeCard, entitySonarQubeContent],
});
