/** In contrast to the built-in Capitalize type, this type alias capitalizes strings when they are all in upper case */
export type Capitalized<S extends string> = Capitalize<Lowercase<S>>;

export const capitalize = <S extends string>(text: S): Capitalized<S> =>
  (text[0].toUpperCase() + text.slice(1).toLowerCase()) as Capitalized<S>;

export const ellipsis = <S extends string>(text: S, prefixLength: number = 8) =>
  `${text.slice(0, prefixLength)}...`;
