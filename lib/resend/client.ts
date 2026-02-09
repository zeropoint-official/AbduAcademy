import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email - update this to your verified domain in Resend
export const DEFAULT_FROM_EMAIL = 'Abdu Academy <onboarding@resend.dev>';
