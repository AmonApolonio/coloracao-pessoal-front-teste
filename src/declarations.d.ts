/// <reference types="vite/client" />

declare module '@fortawesome/react-fontawesome';
declare module '@fortawesome/free-solid-svg-icons';
declare module '@fortawesome/fontawesome-svg-core';

// Vite env type fix for ImportMeta
interface ImportMetaEnv {
  readonly VITE_N8N_POST_URL?: string;
  // add more env vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
