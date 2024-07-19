export function sortArrayOfObjAlphabeticalByKey<T>(
  array: T,
  key: string,
  order?: 'ascending' | 'descending',
): T {
  const orderType = order ? order : 'ascending';
  const arrayCopy = [...(array as [])];
  const sortedArray = arrayCopy.sort((a, b) => {
    const aString = a[key as keyof T] as string;
    const bString = b[key as keyof T] as string;
    return orderType === 'ascending'
      ? aString.localeCompare(bString)
      : bString.localeCompare(aString);
  });

  return sortedArray as T;
}
