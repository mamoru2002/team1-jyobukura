/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_DEFAULT_USER_ID?: string;
  }
}

export {};
