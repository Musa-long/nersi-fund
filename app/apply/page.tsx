"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { BANKS } from "@/lib/banks";

const ID_TYPES = [
  "National ID (NIN slip)",
  "Driver's licence",
  "Permanent voter's card (PVC)",
  "International passport",
  "None available",
];

const STEP_TITLES = [
  "Personal information",
  "Identity and payment details",
  "Review and submit",
];

type Form = {
  fullName: string;
  phone: string;
  dob: string;
  email: string;
  address: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bvn: string;
  nin: string;
  idType: string;
  consent: boolean;
};

const EMPTY: Form = {
  fullName: "",
  phone: "",
  dob: "",
  email: "",
  address: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  bvn: "",
  nin: "",
  idType: ID_TYPES[0],
  consent: false,
};

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="err">{error}</p>}
    </div>
  );
}

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [photo, setPhoto] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const digits = (v: string) => v.replace(/\D/g, "");

  function validateStep1() {
    const e: Record<string, string> = {};
    if (form.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
      e.fullName = "Enter first name and surname.";
    }
    if (!/^(\+?234|0)[789][01]\d{8}$/.test(form.phone.replace(/[\s-]/g, ""))) {
      e.phone = "Enter a valid Nigerian number.";
    }
    if (!form.dob) e.dob = "Enter your date of birth.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      e.email = "Enter a valid email.";
    }
    if (form.address.trim().length < 12) {
      e.address = "Enter your full residential address.";
    }
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(2);
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!/^\d{11}$/.test(digits(form.bvn))) e.bvn = "BVN must be 11 digits.";
    if (!/^\d{11}$/.test(digits(form.nin))) e.nin = "NIN must be 11 digits.";
    if (!form.bankName) e.bankName = "Select your bank.";
    if (!/^\d{10}$/.test(digits(form.accountNumber))) {
      e.accountNumber = "Enter a valid 10-digit account number.";
    }
    if (form.accountName.trim().length < 3) {
      e.accountName = "Enter the account name on the bank record.";
    }
    if (!photo) {
      e.photo = "Upload a recent photograph.";
    } else if (photo.size > 5 * 1024 * 1024) {
      e.photo = "Photograph must be under 5MB.";
    }
    if (idFile && idFile.size > 8 * 1024 * 1024) {
      e.idFile = "ID file must be under 8MB.";
    }
    if (form.idType !== "None available" && !idFile) {
      e.idFile = "Upload the ID document.";
    }
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(3);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.consent) {
      setBanner("Tick the consent box to continue.");
      return;
    }

    setSubmitting(true);
    setBanner(null);

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, String(value)));
    body.append("website", "");
    if (photo) body.append("photo", photo);
    if (idFile) body.append("idFile", idFile);

    try {
      const res = await fetch("/api/register", { method: "POST", body });
      const data = await res.json();

      if (data.ok) {
        setRef(data.ref);
        window.scrollTo(0, 0);
      } else if (data.errors) {
        setErrors(data.errors);
        setBanner("Check the highlighted fields.");
        const first = Object.keys(data.errors)[0];
        if (first === "bvn" || first === "nin" || first === "photo" || first === "idFile" || first === "bankName" || first === "accountNumber" || first === "accountName") {
          setStep(2);
        } else {
          setStep(1);
        }
      } else {
        setBanner(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setBanner("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setRef(null);
    setStep(1);
    setForm({ ...EMPTY });
    setPhoto(null);
    setIdFile(null);
    setErrors({});
    setBanner(null);
  }

  if (ref) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="bg-forest-dark py-4 text-white">
          <div className="wrap flex items-center justify-between gap-3">
            <Link href="/" className="text-sm font-semibold">← NERSI Portal</Link>
            <a href="tel:07000222222" className="text-xs font-bold text-gold-light">0700-022-2222</a>
          </div>
        </div>
        <div className="wrap max-w-2xl py-10">
          <div className="card border-t-4 border-t-forest text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest text-3xl text-white">✓</div>
            <h2 className="mt-5 text-2xl font-extrabold text-forest-dark">Registration received</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your details have been submitted for verification.
            </p>
            <div className="mt-6 rounded-lg border-2 border-dashed border-forest/30 bg-forest/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your reference</p>
              <p className="mt-1 font-mono text-xl font-bold text-forest-dark">{ref}</p>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Screenshot this screen. Keep the reference for any enquiry.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/" className="btn-ghost">Back to home</Link>
              <button onClick={reset} className="btn-primary">Register another person</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
          <form onSubmit={submit} className="card" noValidate>
            <div className="mb-6 flex items-center gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 flex-1 rounded-full ${step >= n ? "bg-forest" : "bg-slate-200"}`}
                />
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-gold">
              Step {step} of 3 — {STEP_TITLES[step - 1]}
            </p>

            {banner && (
              <p className="mt-4 rounded-lg border border-alert/30 bg-alert/10 p-3 text-sm font-medium text-alert">
                {banner}
              </p>
            )}

            {step === 1 && (
              <div className="mt-5 space-y-4">
                <Field label="Full name" hint="Exactly as it appears on your BVN." error={errors.fullName}>
                  <input
                    className="input"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Adaeze Chidinma Okafor"
                    autoComplete="name"
                  />
                </Field>

                <Field label="Active Nigerian phone number" hint="Use the number linked to your BVN." error={errors.phone}>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="08031234567"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>

                <Field label="Date of birth" error={errors.dob}>
                  <input
                    type="date"
                    className="input"
                    value={form.dob}
                    onChange={(e) => set("dob", e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </Field>

                <Field label="Email address" error={errors.email}>
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>

                <Field label="Residential address" hint="Street, town and state." error={errors.address}>
                  <textarea
                    className="input"
                    rows={3}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="14 Awolowo Road, Ikoyi, Lagos"
                  />
                </Field>

                <button type="button" onClick={validateStep1} className="btn-primary w-full">
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 space-y-4">
                <Field label="Bank Verification Number (BVN)" hint="11 digits. Not your account number." error={errors.bvn}>
                  <input
                    className="input tracking-widest"
                    value={form.bvn}
                    onChange={(e) => set("bvn", e.target.value)}
                    placeholder="22123456789"
                    inputMode="numeric"
                    maxLength={14}
                  />
                </Field>

                <Field label="National Identification Number (NIN)" hint="11 digits." error={errors.nin}>
                  <input
                    className="input tracking-widest"
                    value={form.nin}
                    onChange={(e) => set("nin", e.target.value)}
                    placeholder="12345678901"
                    inputMode="numeric"
                    maxLength={14}
                  />
                </Field>

                <div className="space-y-4 border-t border-slate-200 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                    Bank account for payment
                  </p>

                  <Field label="Bank" error={errors.bankName}>
                    <select
                      className="input"
                      value={form.bankName}
                      onChange={(e) => set("bankName", e.target.value)}
                    >
                      <option value="">Select your bank</option>
                      {BANKS.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Account number" hint="10 digits (NUBAN)." error={errors.accountNumber}>
                    <input
                      className="input tracking-widest"
                      value={form.accountNumber}
                      onChange={(e) => set("accountNumber", e.target.value)}
                      placeholder="0123456789"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </Field>

                  <Field label="Account name" hint="Exactly as it appears on your bank record." error={errors.accountName}>
                    <input
                      className="input"
                      value={form.accountName}
                      onChange={(e) => set("accountName", e.target.value)}
                      placeholder="Adaeze Chidinma Okafor"
                      autoComplete="off"
                    />
                  </Field>
                </div>

                <Field label="Recent photograph" hint="Clear face, plain background, under 5MB." error={errors.photo}>
                  <input
                    type="file"
                    accept="image/*"
                    className="input py-2.5"
                    onChange={(e) => {
                      setPhoto(e.target.files?.[0] ?? null);
                      setErrors((prev) => ({ ...prev, photo: "" }));
                    }}
                  />
                </Field>

                <Field label="Type of government ID" error={errors.idType}>
                  <select
                    className="input"
                    value={form.idType}
                    onChange={(e) => set("idType", e.target.value)}
                  >
                    {ID_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </Field>

                {form.idType !== "None available" && (
                  <Field label="Upload the ID" hint="Photo or PDF, under 8MB." error={errors.idFile}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="input py-2.5"
                      onChange={(e) => {
                        setIdFile(e.target.files?.[0] ?? null);
                        setErrors((prev) => ({ ...prev, idFile: "" }));
                      }}
                    />
                  </Field>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1">
                    ← Back
                  </button>
                  <button type="button" onClick={validateStep2} className="btn-primary flex-[2]">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-5 space-y-4">
                <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {([
                    ["Name", form.fullName],
                    ["Phone", form.phone],
                    ["Date of birth", form.dob],
                    ["Email", form.email],
                    ["Address", form.address],
                    ["Bank", form.bankName],
                    ["Account number", form.accountNumber],
                    ["Account name", form.accountName],
                    ["BVN", form.bvn],
                    ["NIN", form.nin],
                    ["ID type", form.idType],
                    ["Photograph", photo?.name ?? "not attached"],
                    ["ID document", idFile?.name ?? (form.idType === "None available" ? "n/a" : "not attached")],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="max-w-[60%] break-words text-right font-medium text-slate-800">
                        {value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <label className="flex gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => set("consent", e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-forest"
                    />
                    <span>
                      I confirm these details are mine and correct, and consent to them being used for NERSI verification.
                    </span>
                  </label>
                  {errors.consent && <p className="err">{errors.consent}</p>}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1" disabled={submitting}>
                    ← Back
                  </button>
                  <button type="submit" className="btn-primary flex-[2]" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit registration"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          Your details are used only for NERSI verification and are handled in line with the Nigeria Data Protection Act 2023.
        </p>
      </div>
    </main>
  );
                }
