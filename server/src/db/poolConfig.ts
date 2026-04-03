import type { PoolConfig } from 'pg';

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const shouldEnableSsl = (connectionString: string): boolean => {
  try {
    const parsedUrl = new URL(connectionString);
    const ssl = (parsedUrl.searchParams.get('ssl') || '').toLowerCase();
    const sslMode = (parsedUrl.searchParams.get('sslmode') || '').toLowerCase();
    return (
      ssl === 'true' ||
      ssl === '1' ||
      sslMode === 'require' ||
      sslMode === 'verify-ca' ||
      sslMode === 'verify-full'
    );
  } catch {
    return false;
  }
};

export const buildPoolConfig = (overrides: Partial<PoolConfig> = {}): PoolConfig => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const baseConfig: PoolConfig = {
    connectionString,
    connectionTimeoutMillis: parsePositiveInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10000),
    idleTimeoutMillis: parsePositiveInt(process.env.DB_IDLE_TIMEOUT_MS, 30000),
    max: parsePositiveInt(process.env.DB_POOL_MAX, 10),
    keepAlive: true,
    ...(process.env.DB_FORCE_IPV4 === 'true' ? { family: 4 } : {}),
  };

  if (shouldEnableSsl(connectionString)) {
    baseConfig.ssl = { rejectUnauthorized: false };
  }

  return {
    ...baseConfig,
    ...overrides,
  };
};
