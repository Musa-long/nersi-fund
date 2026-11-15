'use client';

import { useState } from 'react';
import Link from 'next/link';

type Errs = Record<string, string>;

const ID_TYPES = [
  "National ID (NIN slip)",
  "Driver's licence",
  'Permanent voter's card (PVC)',
  'International passport',
  'None available',
];

export default function ApplyForm() {
  const [step, setStep] = useState(1);
  const [errs, setErrs] = useState<Errs>({});
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '', phone: '', dob: '', email: '', address: '',
    bvn: '', nin: '', idType: ID_TYPES[0], consent: false,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);

  const set = (k: string, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrs(e => ({ ...e, [k]: '' }));
  };

  function checkStep1() {
    const e: Errs = {};
    if (form.fullName.trim().split(/\s+/).filter(Boolean).length < 2) e.fullName = 'Enter first name and surname.';
    if (!/^(\+?234|0)[789][01]\d{8}$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid Nigerian number.';
    if (!form.dob) e.dob = 'Enter your date of birth.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Enter a valid email.';
    if (form.address.trim().length < 12) e.address = 'Enter your full residential address.';
    setErrs(e);
    if (!Object.keys(e).length) setStep(2);
  }

  function checkStep2() {
    const e: Errs = {};
    if (!/^\d{11}$/.test(form.bvn.replace(/\D/g, ''))) e.bvn = 'BVN must be 11 digits.';
    if (!/^\d{11}$/.test(form.nin.replace(/\D/g, ''))) e.nin = 'NIN must be 11 digits.';
    if (!photo) e.photo = 'Upload a recent photograph.';
    else if (photo.size > 5 * 1024 * 1024) e.photo = 'Photograph must be under 5MB.';
    if (idFile && idFile.size > 8 * 1024 * 1024) e.idFile = 'ID file must be under 8MB.';
    setErrs(e);
    if (!Object.keys(e).length) setStep(3);
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.consent) { setTopError('Tick the consent box to continue.'); return; }
    setBusy(true); setTopError(null);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append('website', '');
    if (photo) fd.append('photo', photo);
    if (idFile) fd.append('idFile', idFile);

    try {
      const res = await fetch('/api/register', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.ok) { setRef(json.ref); window.scrollTo(0, 0); }
      else if (json.errors) { setErrs(json.errors); setTopError('Check the highlighted fields.'); }
      else setTopError(json.error ?? 'Something went wrong. Try again.');
    } catch {
      setTopError('Network error. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (ref) {
    return (
      <div className="card border-t-4 border-t-forest text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest text-3xl text-white">✓</div>
        <h2 className="mt-5 text-2xl font-extrabold text-forest-dark">Registration received</h2>
        <p className="mt-2 text-sm text-slate-600">Your details have been submitted for verification.</p>
        <div className="mt-6 rounded-lg border-2 border-dashed border-forest/30 bg-forest/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your reference</p>
          <p className="mt-1 font-mono text-xl font-bold text-forest-dark">{ref}</p>
        </div>
        <p className="mt-4 text-xs text-slate-500">Screenshot this screen. Keep the reference for any enquiry.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-ghost">Back to home</Link>
          <button onClick={() => { setRef(null); setStep(1); setForm({ ...form, bvn: '', nin: '', consent: false }); setPhoto(null); setIdFile(null); }} className="btn-primary">
            Register another person
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card">
      {/* progress */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map(n => (
          <div key={n} className={`h-1.5 flex-1 rounded-full ${step >= n ? 'bg-forest' : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">
        Step {step} of 3 — {['Personal information', 'Identity verification', 'Review and submit'][step - 1]}
      </p>

      {topError && (
        <p className="mt-4 rounded-lg border border-alert/30 bg-alert/10 p-3 text-sm font-medium text-alert">{topError}</p>
      )}

      {step === 1 && (
        <div className="mt-5 space-y-4">
          <Field label="Full name" hint="Exactly as it appears on your BVN." error={errs.fullName}>
            <input className="input" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Adaeze Chidinma Okafor" autoComplete="name" />
          </Field>
          <Field label="Active Nigerian phone number" hint="Use the number linked to your BVN." error={errs.phone}>
            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="08031234567" inputMode="tel" autoComplete="tel" />
          </Field>
          <Field label="Date of birth" error={errs.dob}>
            <input type="date" className="input" value={form.dob} onChange={e => set('dob', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
          </Field>
          <Field label="Email address" error={errs.email}>
            <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field label="Residential address" hint="Street, town and state." error={errs.address}>
            <textarea className="input" rows={3} value={form.address} onChange={e => set('address', e.target.value)} placeholder="14 Awolowo Road, Ikoyi, Lagos" />
          </Field>
          <button type="button" onClick={checkStep1} className="btn-primary w-full">Continue →</button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-5 space-y-4">
          <Field label="Bank Verification Number (BVN)" hint="11 digits. Not your account number." error={errs.bvn}>
            <input className="input tracking-widest" value={form.bvn} onChange={e => set('bvn', e.target.value)} placeholder="22123456789" inputMode="numeric" maxLength={14} />
          </Field>
          <Field label="National Identification Number (NIN)" hint="11 digits." error={errs.nin}>
            <input className="input tracking-widest" value={form.nin} onChange={e => set('nin', e.target.value)} placeholder="12345678901" inputMode="numeric" maxLength={14} />
          </Field>
          <Field label="Recent photograph" hint="Clear face, plain background, under 5MB." error={errs.photo}>
            <input type="file" accept="image/*" className="input py-2.5" onChange={e => { setPhoto(e.target.files?.[0] ?? null); setErrs(x => ({ ...x, photo: '' })); }} />
          </Field>
          <Field label="Type of government ID" error={errs.idType}>
            <select className="input" value={form.idType} onChange={e => set('idType', e.target.value)}>
              {ID_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          {form.idType !== 'None available' && (
            <Field label="Upload the ID" hint="Photo or PDF, under 8MB." error={errs.idFile}>
              <input type="file" accept="image/*,application/pdf" className="input py-2.5" onChange={e => { setIdFile(e.target.files?.[0] ?? null); setErrs(x => ({ ...x, idFile: '' })); }} />
            </Field>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
            <button type="button" onClick={checkStep2} className="btn-primary flex-[2]">Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-5 space-y-4">
          <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {[
              ['Name', form.fullName], ['Phone', form.phone], ['Date of birth', form.dob],
              ['Email', form.email], ['Address', form.address], ['BVN', form.bvn],
              ['NIN', form.nin], ['ID type', form.idType],
              ['Photograph', photo?.name ?? 'not attached'],
              ['ID document', idFile?.name ?? (form.idType === 'None available' ? 'n/a' : 'not attached')],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                <dt className="text-slate-500">{k}</dt>
                <dd className="max-w-[60%] break-words text-right font-medium text-slate-800">{v || '—'}</dd>
              </div>
            ))}
          </dl>
          <label className="flex gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)} className="mt-0.5 h-4 w-4 accent-forest" />
            <span>I confirm these details are mine and correct, and consent to them being used for NERSI verification.</span>
          </label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1" disabled={busy}>← Back</button>
            <button type="submit" className="btn-primary flex-[2]" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit registration'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="err">{error}</p>}
    </div>
  );
}
