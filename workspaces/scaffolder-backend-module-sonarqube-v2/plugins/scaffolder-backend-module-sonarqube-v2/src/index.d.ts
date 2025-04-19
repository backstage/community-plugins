/// <reference lib="dom" />

declare global {
  interface Window {
    fetch: typeof globalThis.fetch;
  }

  interface Global {
    fetch: typeof globalThis.fetch;
  }
}

export {};
