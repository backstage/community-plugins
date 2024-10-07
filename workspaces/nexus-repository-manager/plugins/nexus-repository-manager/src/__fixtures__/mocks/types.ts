export type MockArgs<T> = Partial<{
  [K in keyof T]: ReturnType<(typeof jest)['fn']>;
}>;
