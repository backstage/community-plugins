export const isNonNullable = <T = unknown>(value: T): value is NonNullable<T> =>
  value !== null && typeof value !== 'undefined';

export const hasOwnProp = <X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> => {
  return obj.hasOwnProperty(prop);
};
