import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envFiles = process.env.NODE_ENV === 'test'
    ? [path.resolve(process.cwd(), '.env.test')]
    : [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../.env'),
        path.resolve(__dirname, '../../../.env'),
    ];
const envFile = envFiles.find((candidate) => fs.existsSync(candidate));

if (envFile) {
    dotenv.config({ path: envFile, quiet: true });
}

if (!process.env.DATABASE_URL) {
    const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;

    if (POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DB) {
        const user = encodeURIComponent(POSTGRES_USER);
        const password = encodeURIComponent(POSTGRES_PASSWORD);
        const database = encodeURIComponent(POSTGRES_DB);
        const host = process.env.POSTGRES_HOST ?? 'localhost';
        const port = process.env.POSTGRES_PORT ?? '5432';

        process.env.DATABASE_URL =
            `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
    }
}