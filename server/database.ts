import { Pool } from 'pg';
import { getSecretValue } from './awsSecrets';

let pool: Pool | null = null;

export async function initializeDatabase() {
  if (pool) return pool;

  try {
    // Get database credentials from AWS Secrets Manager
    const dbCreds = await getSecretValue(process.env.DB_SECRET_ARN!);
    const credentials = JSON.parse(dbCreds);

    pool = new Pool({
      host: credentials.host || process.env.PGHOST || 'commanders-marketplace-db.clg044gmyrhs.us-east-1.rds.amazonaws.com',
      user: credentials.username || process.env.PGUSER || 'commander',
      password: credentials.password || process.env.PGPASSWORD,
      database: credentials.dbname || process.env.PGDATABASE || 'commanders-marketplace-db',
      port: Number(process.env.PGPORT) || 5432,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test the connection
    await pool.query('SELECT NOW()');
    console.log('Database connection established successfully');
    return pool;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}
