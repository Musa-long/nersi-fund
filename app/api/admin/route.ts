import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get('key');
  if (!key || key !== process.env.ADMIN_KEY) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const pool = await db();
  const { rows } = await pool.query(
    `SELECT ref, full_name, phone, email, bvn, nin, notified, created_at
     FROM applications ORDER BY created_at DESC LIMIT 200`
  );
  return Response.json({ ok: true, count: rows.length, rows });
}
