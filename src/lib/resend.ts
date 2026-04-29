// src/lib/resend.ts
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is missing. Email sending will be skipped.');
}

export const resend = new Resend(process.env.RESEND_API_KEY || '');