/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv,
}

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string,
  readonly VITE_OPENAI_ORGANIZATION_ID: string,
  readonly VITE_OPENAI_USER_ID: string,
}
