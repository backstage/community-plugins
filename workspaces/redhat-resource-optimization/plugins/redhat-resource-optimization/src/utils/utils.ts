import { RecommendationsRecommendationsCurrent } from '@backstage-community/plugin-redhat-resource-optimization-common';

const getPercentage = (currentVal: number, recommendedVal: number): number => {
  if (currentVal === 0) {
    return 0;
  }
  const changeValue = recommendedVal - currentVal;
  return parseFloat(((changeValue / currentVal) * 100).toFixed(2));
};

export const getRecommendedValue = (
  currentValues: RecommendationsRecommendationsCurrent,
  recommendedValues: RecommendationsRecommendationsCurrent,
  key1: 'limits' | 'requests',
  key2: 'cpu' | 'memory',
) => {
  let currentVal = currentValues[key1]?.[key2]?.amount || 0;
  const currentFormat = currentValues[key1]?.[key2]?.format || '';
  let recommendedVal = recommendedValues[key1]?.[key2]?.amount || 0;
  const recommendedFormat = recommendedValues[key1]?.[key2]?.format || '';

  if (recommendedVal === 0) {
    return '-';
  }

  // Convert units if not the same
  if (
    currentFormat &&
    recommendedFormat &&
    currentFormat !== recommendedFormat
  ) {
    if (key2 === 'cpu') {
      // Convert cores to millicores
      //
      // Note: units may be null to omit "cores" label for Kubernetes
      const getMultiplier = (units: string) => {
        return units === null || units === 'cores' ? 1000 : 1;
      };
      currentVal = currentVal * getMultiplier(currentFormat || 'cores');
      recommendedVal =
        recommendedVal * getMultiplier(recommendedFormat || 'cores');
    } else if (key2 === 'memory') {
      // Convert Gi, Mi, etc. to bytes
      //
      // See https://medium.com/swlh/understanding-kubernetes-resource-cpu-and-memory-units-30284b3cc866
      //
      // Ei = EiB = Exbibyte. 1Ei = 2⁶⁰ = 1,152,921,504,606,846,976 bytes
      // Pi = PiB = Pebibyte. 1Pi = 2⁵⁰ = 1,125,899,906,842,624 bytes
      // Ti = TiB = Tebibyte. 1Ti = 2⁴⁰ = 1,099,511,627,776 bytes
      // Gi = GiB = Gibibyte. 1Gi = 2³⁰ = 1,073,741,824 bytes
      // Mi = MiB = Mebibyte. 1Mi = 2²⁰ = 1,048,576 bytes
      // Ki = KiB = Kibibyte. 1Ki = 2¹⁰ = 1,024 bytes
      const getMultiplier = (units: string) => {
        switch (units.toLowerCase()) {
          case 'ei':
            return Math.pow(2, 60);
          case 'pi':
            return Math.pow(2, 50);
          case 'ti':
            return Math.pow(2, 40);
          case 'gi':
            return Math.pow(2, 30);
          case 'mi':
            return Math.pow(2, 20);
          case 'ki':
            return Math.pow(2, 10);
          default:
            return 1;
        }
      };
      currentVal = currentVal * getMultiplier(currentFormat || 'bytes');
      recommendedVal =
        recommendedVal * getMultiplier(recommendedFormat || 'byes');
    }
  }

  // Calculate percentage change
  const percentage: number = getPercentage(currentVal, recommendedVal);

  const paddingValue = { cpu: 20, memory: 17 };
  const percentageSign = percentage > 0 ? '+' : '';

  const formattedRecommendedValue =
    `${recommendedVal}${recommendedFormat}`.padEnd(paddingValue[key2]);
  const formattedPercentageValue = `# ${percentageSign}${percentage}%`;
  return `${formattedRecommendedValue}${formattedPercentageValue}`;
};

export const isEmptyObject = (obj?: {}): boolean => {
  if (obj) {
    return Object.keys(obj).length === 0;
  }

  return true;
};
