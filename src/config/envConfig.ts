interface ImportMetaEnv {
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

class EnvConfig {
  static getEnvVariable(key: string): string | undefined {
    return import.meta.env[key];
  }
}

export default EnvConfig;
