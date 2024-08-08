import { chart_color_blue_100 } from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import { chart_color_blue_200 } from '@patternfly/react-tokens/dist/js/chart_color_blue_200';
import { chart_color_blue_400 } from '@patternfly/react-tokens/dist/js/chart_color_blue_400';
import { chart_color_red_200 } from '@patternfly/react-tokens/dist/js/chart_color_red_200';

export const chartStyles = {
  limit: {
    fill: 'none',
  },
  limitColorScale: [chart_color_red_200.value],
  request: {
    fill: 'none',
  },
  requestColorScale: [chart_color_blue_400.value],
  usageColorScale: [chart_color_blue_100.value, chart_color_blue_200.value],
};
