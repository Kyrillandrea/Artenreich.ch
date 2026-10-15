import nodemailer, { type Transporter } from 'nodemailer';
import { inquirySubject, inquiryToText, type InquiryInput } from './inquiry';

/**
 * E-Mail-Versand der Anfragen über SMTP. Sämtliche Zugangsdaten kommen ausschliesslich
 * aus Umgebungsvariablen des Servers (siehe .env.example) – nie aus dem Frontend.
 */
export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  to: string;
}

export function readMailConfig(env: NodeJS.ProcessEnv = process.env): MailConfig | null {
  const host = env.SMTP_HOST?.trim();
  const from = env.MAIL_FROM?.trim();
  const to = env.MAIL_TO?.trim();
  if (!host || !from || !to) return null;
  const port = Number(env.SMTP_PORT || 587);
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure: env.SMTP_SECURE === 'true',
    user: env.SMTP_USER?.trim() || undefined,
    pass: env.SMTP_PASS || undefined,
    from,
    to,
  };
}

let cached: { key: string; transporter: Transporter } | null = null;

function getTransporter(config: MailConfig): Transporter {
  const key = `${config.host}:${config.port}:${config.secure}:${config.user ?? ''}`;
  if (cached?.key === key) return cached.transporter;
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass ?? '' } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  cached = { key, transporter };
  return transporter;
}

/** Versendet die Anfrage. Wirft bei jedem Fehler – nur ein erfolgreicher Versand gilt als angenommen. */
export async function sendInquiry(config: MailConfig, input: InquiryInput): Promise<void> {
  const transporter = getTransporter(config);
  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: { name: input.name, address: input.email },
    subject: inquirySubject(input),
    text: `Neue Anfrage über die Website\n\n${inquiryToText(input)}\n`,
  });
}
