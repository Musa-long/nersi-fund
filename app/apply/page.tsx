import Link from 'next/link';
import ApplyForm from '@/components/ApplyForm';

export const metadata = { title: 'Register — NERSI Portal' };

export default function Apply() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-forest-dark py-4 text-white">
        <div className="wrap flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold">← NERSI Portal</Link>
          <a href="tel:07000222222" className="text-xs font-bold text-gold-light">0700-022-2222</a>
        </div>
      </div>
      <div className="wrap max-w-2xl py-10">
        <h1 className="text-2xl font-extrabold text-forest-dark">Registration form</h1>
        <p className="mt-2 text-sm text-slate-600">
          Complete all three steps. Free of charge — never pay an agent.
        </p>
        <div className="mt-7">
          <ApplyForm />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          Your details are used only for NERSI verification and are handled in line with the
          Nigeria Data Protection Act 2023.
        </p>
      </div>
    </main>
  );
}
