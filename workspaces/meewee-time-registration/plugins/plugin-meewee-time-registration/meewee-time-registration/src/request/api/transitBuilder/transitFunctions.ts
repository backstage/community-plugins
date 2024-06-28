import * as transit from 'transit-js';

export const isStringTransit = (input: string | undefined): boolean => {
  return input
    ? input.includes('[') || input.includes(']') || input.includes('~#')
    : false;
};

export const readTransitJs = (data: string) => {
  const r = transit.reader('json');

  return r.read(data);
};

export const getTransitData = (mappedData: any, keyword: string) => {
  return mappedData.get(transit.keyword(keyword));
};

export const getKeySetFromTransitSet = (transitSetData: any): string[] | [] => {
  const transformedLegalAccept: string[] = (
    transitSetData?.keySet() || []
  ).reduce((legalAccept: string[], set: any) => {
    if (set?.name()) {
      legalAccept.push(set.name());
    }
    return legalAccept;
  }, []);
  return transformedLegalAccept;
};

type MappedValues = {
  [key: string]: any;
};
export function getTransitDataCollection<T>(
  transitData: any,
  mapToObject: MappedValues,
): T {
  return Object.entries(mapToObject).reduce(
    (mappedData: MappedValues, [key, value]) => {
      mappedData[key] = transitData.get(transit.keyword(value));

      if (transit.isKeyword(mappedData[key])) {
        mappedData[key] = mappedData[key].name();
      }

      return mappedData;
    },
    {},
  ) as T;
}

export function mapTransitArrayMapToObject<T>(transitData: any): T {
  return transit.mapToObject(transitData) as T;
}

export const createTransitData = (
  rawData: any,
  creationType?: 'single' | 'multiple',
) => {
  const w = transit.writer('json');
  const objectArray: any = [];
  for (const [key, value] of Object.entries<any>(rawData)) {
    objectArray.push(transit.keyword(key));

    if (value.isKeyword) {
      objectArray.push(transit.keyword(value.value));
    } else {
      objectArray.push(value.value);
    }
  }

  const mappedData = transit.map(objectArray);
  const transitData = w.write(mappedData);

  if (creationType === 'multiple') {
    return JSON.parse(transitData);
  }
  return transitData;
};
