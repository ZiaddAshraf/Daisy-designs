export type EmailMessage = { to: string; subject: string; html: string };
export interface EmailService { send(message: EmailMessage): Promise<void>; }
export class ResendEmailService implements EmailService { async send(message: EmailMessage) { if (!process.env.RESEND_API_KEY) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED"); void message; throw new Error("RESEND_PROVIDER_NOT_IMPLEMENTED"); } }
