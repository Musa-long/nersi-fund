import Link from 'next/link';
import Image from 'next/image';

const STEPS = [
  ['Register your details', 'Fill the form with your personal and identity information. Takes about three minutes.'],
  ['Verification', 'Your BVN and NIN are checked against the details you supplied.'],
  ['Screening', 'Your household is screened alongside the National Social Register.'],
  ['Wallet payment', 'Selected beneficiaries are credited ₦50,000 through an approved provider.'],
];

const NEED = [
  'Full name as it appears on your BVN',
  'Active Nigerian phone number linked to your BVN',
  'Date of birth and residential address',
  'BVN — 11 digits',
  'NIN — 11 digits',
  'A clear recent photograph of yourself',
  'A valid government ID, if you have one',
];

const PROVIDERS = ['ALAT by Wema', 'MoMo PSB', 'NairaGram', 'OPay', 'Moniepoint'];

export default function Home() {
  return (
    <main>
      {/* masthead */}
      <div className="border-b-4 border-gold bg-forest-dark text-white">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-2.5 text-[11px] tracking-wide sm:text-xs">
          <span className="font-semibold uppercase">Federal Republic of Nigeria</span>
          <a href="tel:07000222222" className="font-bold">Helpline: 0700-022-2222</a>
        </div>
      </div>

      {/* hero */}
      <section className="relative isolate overflow-hidden bg-forest-dark">
        <Image
          src="/hero.jpg"
          alt="NERSI ₦50,000 relief payment — Federal Government of Nigeria"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/40 via-forest-dark/60 to-forest-dark/90" />
        <div className="wrap relative py-14 sm:py-20">
          <p className="mb-3 inline-block rounded-full bg-alert px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">
            Federal Government Intervention
          </p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white drop-shadow sm:text-5xl">
            ₦50,000 Relief Payment.<br />
            <span className="text-gold-light">Register for verification.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
            The National Emergency Relief and Stabilisation Intervention supports poor and
            vulnerable Nigerian households with ₦50,000. Registration is free. No agent.
            No middleman.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/apply" className="btn-gold">Start registration →</Link>
            <a href="#how" className="btn border-2 border-white/40 text-white hover:border-white">
              How it works
            </a>
          </div>
          <p className="mt-5 text-xs text-white/70">
            Free to register · Consent comes first · Payments independently verified
          </p>
        </div>
      </section>

      {/* notice */}
      <div className="bg-gold/15">
        <div className="wrap flex gap-3 py-4 text-[13px] leading-relaxed text-forest-dark">
          <span className="font-bold">Note:</span>
          <p>
            Final selection is made by the Federal Ministry of Humanitarian Affairs and Poverty
            Reduction from verified records and the National Social Register. Registering here
            submits your details for assessment — it is not a guarantee of payment.
          </p>
        </div>
      </div>

      {/* about */}
      <section className="wrap py-14">
        <div className="rule mb-4" />
        <h2 className="text-2xl font-extrabold text-forest-dark sm:text-3xl">About the programme</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
          NERSI is a shock-responsive cash transfer from the Federal Government, delivered
          through mobile wallets to households struggling with the cost of living. It is a grant,
          not a loan — nothing is repaid and nothing is deducted.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['₦50,000', 'Paid in full to your wallet'],
            ['All 36 states + FCT', 'Across all six geopolitical zones'],
            ['No fees', 'Never pay anyone to be listed'],
          ].map(([big, small]) => (
            <div key={big} className="card border-l-4 border-l-forest">
              <p className="text-xl font-extrabold text-forest">{big}</p>
              <p className="mt-1 text-sm text-slate-600">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="bg-white py-14">
        <div className="wrap">
          <div className="rule mb-4" />
          <h2 className="text-2xl font-extrabold text-forest-dark sm:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="seal font-bold">{i + 1}</span>
                <div>
                  <p className="font-bold text-forest-dark">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* what you need */}
      <section className="wrap py-14">
        <div className="rule mb-4" />
        <h2 className="text-2xl font-extrabold text-forest-dark sm:text-3xl">What you will need</h2>
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {NEED.map(item => (
            <li key={item} className="flex gap-3 text-sm text-slate-700">
              <span className="mt-0.5 font-bold text-forest">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-lg border border-forest/20 bg-forest/5 p-4 text-sm text-forest-dark">
          The phone number you enter should be the one linked to your BVN. A mismatch is the most
          common reason a payment fails.
        </p>
        <Link href="/apply" className="btn-primary mt-7">Begin registration</Link>
      </section>

      {/* providers */}
      <section className="bg-forest py-14 text-white">
        <div className="wrap">
          <div className="rule mb-4 bg-gold" />
          <h2 className="text-2xl font-extrabold sm:text-3xl">Approved payment providers</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/80">
            Selected beneficiaries are paid by one of these five providers. You will get an SMS
            from them — reply YES, then dial their code to open your wallet.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {PROVIDERS.map(p => (
              <div key={p} className="rounded-lg bg-white/10 p-4 text-center text-sm font-semibold">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* safety */}
      <section className="wrap py-14">
        <div className="rule mb-4" />
        <h2 className="text-2xl font-extrabold text-forest-dark sm:text-3xl">Stay safe</h2>
        <div className="mt-6 grid gap-3">
          {[
            'Nobody will ever ask you for money to release your support.',
            'Never share your PIN or OTP — not even with an agent.',
            'Genuine SMS come only from the five approved providers.',
            'Forwarding a WhatsApp chain does not make you a beneficiary.',
          ].map(t => (
            <p key={t} className="flex gap-3 rounded-lg border border-alert/20 bg-alert/5 p-3.5 text-sm text-slate-700">
              <span className="font-bold text-alert">!</span>{t}
            </p>
          ))}
        </div>
      </section>

      {/* faq */}
      <section className="bg-white py-14">
        <div className="wrap">
          <div className="rule mb-4" />
          <h2 className="text-2xl font-extrabold text-forest-dark sm:text-3xl">Questions</h2>
          <div className="mt-6 divide-y divide-slate-200">
            {[
              ['Do I need to register to be paid?', 'Registration is how your details reach the assessment queue. Selection itself remains with the Ministry.'],
              ['Is it a loan?', 'No. It is a grant. You do not pay it back.'],
              ['Does it cost anything to register?', 'No. Registration, the SMS and accepting the payment are all free.'],
              ['Why does the number need to match my BVN?', 'Your wallet is opened against that number. A mismatch blocks payment.'],
              ['Can I register for a family member?', 'Yes — enter their details and their own phone number.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="cursor-pointer list-none font-semibold text-forest-dark marker:hidden">
                  <span className="mr-2 text-forest group-open:rotate-90 inline-block transition">›</span>{q}
                </summary>
                <p className="mt-2 pl-5 text-sm leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="bg-forest-dark py-16 text-center text-white">
        <div className="wrap">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Ready? It takes three minutes.</h2>
          <Link href="/apply" className="btn-gold mt-6">Start registration →</Link>
        </div>
      </section>

      <footer className="bg-[#04200f] py-10 text-xs text-white/60">
        <div className="wrap space-y-3">
          <p className="font-semibold text-white/80">
            National Emergency Relief and Stabilisation Intervention (NERSI)
          </p>
          <p>Federal Ministry of Humanitarian Affairs and Poverty Reduction</p>
          <p>Helpline: <a href="tel:07000222222" className="text-gold-light">0700-022-2222</a></p>
          <p className="pt-2">
            Registration portal · Reference: fmhapr.gov.ng/nersi · ₦50,000 per selected household
          </p>
        </div>
      </footer>
    </main>
  );
}
