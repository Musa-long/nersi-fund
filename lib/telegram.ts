const API = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const CHAT = () => process.env.TELEGRAM_CHAT_ID!;

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function sendText(html: string) {
  const res = await fetch(`${API()}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT(),
      text: html,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`telegram text: ${json.description}`);
}

export async function sendFile(kind: 'photo' | 'document', file: File, caption: string) {
  const form = new FormData();
  form.append('chat_id', CHAT());
  form.append('caption', caption.slice(0, 900));
  form.append(kind, file, file.name || `${kind}.jpg`);

  const res = await fetch(`${API()}/${kind === 'photo' ? 'sendPhoto' : 'sendDocument'}`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`telegram ${kind}: ${json.description}`);
  return String(json.result?.photo?.at(-1)?.file_id ?? json.result?.document?.file_id ?? '');
}
