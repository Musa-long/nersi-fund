export type Fields = {
  fullName: string; phone: string; dob: string; email: string; address: string;
  bvn: string; nin: string; idType: string;
};

const digits = (s: string) => s.replace(/\D/g, '');

export function normalisePhone(raw: string) {
  const d = digits(raw);
  if (d.startsWith('234') && d.length === 13) return `0${d.slice(3)}`;
  if (d.startsWith('0') && d.length === 11) return d;
  return null;
}

export function ageFrom(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function validate(f: Fields): Record<string, string> {
  const e: Record<string, string> = {};

  if (f.fullName.trim().split(/\s+/).filter(Boolean).length < 2)
    e.fullName = 'Enter your full name (first and surname).';

  if (!normalisePhone(f.phone))
    e.phone = 'Enter a valid Nigerian number, e.g. 08031234567.';

  const age = ageFrom(f.dob);
  if (age === null) e.dob = 'Enter your date of birth.';
  else if (age < 18) e.dob = 'You must be 18 or older.';
  else if (age > 110) e.dob = 'Check the year of birth.';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = 'Enter a valid email address.';
  if (f.address.trim().length < 12) e.address = 'Enter your full residential address.';

  if (digits(f.bvn).length !== 11) e.bvn = 'BVN must be exactly 11 digits.';
  if (digits(f.nin).length !== 11) e.nin = 'NIN must be exactly 11 digits.';

  return e;
}
