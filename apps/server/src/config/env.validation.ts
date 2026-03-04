interface EnvVars {
  NODE_ENV: string;
  PORT: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  DEFAULT_ADMIN_USERNAME: string;
  DEFAULT_ADMIN_PASSWORD: string;
  DEFAULT_ADMIN_NICKNAME: string;
  UPLOAD_CDN_BASE_URL: string;
}

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const env = {
    NODE_ENV: String(config.NODE_ENV ?? 'development'),
    PORT: Number(config.PORT ?? 3000),
    JWT_ACCESS_SECRET: String(config.JWT_ACCESS_SECRET ?? ''),
    JWT_REFRESH_SECRET: String(config.JWT_REFRESH_SECRET ?? ''),
    JWT_ACCESS_EXPIRES_IN: String(config.JWT_ACCESS_EXPIRES_IN ?? '2h'),
    JWT_REFRESH_EXPIRES_IN: String(config.JWT_REFRESH_EXPIRES_IN ?? '7d'),
    DEFAULT_ADMIN_USERNAME: String(config.DEFAULT_ADMIN_USERNAME ?? 'admin'),
    DEFAULT_ADMIN_PASSWORD: String(config.DEFAULT_ADMIN_PASSWORD ?? '123456'),
    DEFAULT_ADMIN_NICKNAME: String(config.DEFAULT_ADMIN_NICKNAME ?? '站长'),
    UPLOAD_CDN_BASE_URL: String(config.UPLOAD_CDN_BASE_URL ?? 'https://cdn.example.com'),
  };

  if (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) {
    throw new Error('环境变量缺失：JWT_ACCESS_SECRET / JWT_REFRESH_SECRET 必填');
  }

  if (Number.isNaN(env.PORT) || env.PORT <= 0) {
    throw new Error('环境变量错误：PORT 必须是正整数');
  }

  return env;
}
