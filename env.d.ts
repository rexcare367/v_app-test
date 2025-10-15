/// <reference types="vite/client" />
/// <reference types="@react-router/node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLEAROUT_API_TOKEN?: string;
    }
  }
}

export {};