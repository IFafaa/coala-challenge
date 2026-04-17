import * as process from 'process';

export interface IConfiguration {
  env: string;
  port: number;
  databaseUrl: string;
}

export const configuration = (): IConfiguration => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? '',
});
