import { NextResponse } from 'next/server';

import type { ContactForm } from '@/lib/booking-types';
import { sendResendEmail } from '@/lib/email/resend';
import { SITE_PROFILE } from '@/lib/site-profile';

export const runtime = 'nodejs';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizePayload(rawPayload: unknown): ContactForm | null {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return null;
  }

  const payload = rawPayload as Partial<Record<keyof ContactForm, unknown>>;
  const fullName = getString(payload.fullName);
  const email = getString(payload.email);
  const phone = getString(payload.phone);
  const message = getString(payload.message);

  if (!fullName || !EMAIL_PATTERN.test(email) || !message) {
    return null;
  }

  return {
    fullName,
    email,
    phone,
    message,
  };
}

function getContactRecipient(): string {
  // This is intentionally public because it is the customer-facing support inbox.
  return SITE_PROFILE.supportEmail;
}

function buildContactEmail(payload: ContactForm): { html: string; text: string } {
  const text = [
    'New Cruizn Clean contact request',
    '',
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || 'Not provided'}`,
    '',
    'Message:',
    payload.message,
  ].join('\n');

  const html =
    '<h1>New Cruizn Clean contact request</h1>' +
    `<p><strong>Name:</strong> ${escapeHtml(payload.fullName)}</p>` +
    `<p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>` +
    `<p><strong>Phone:</strong> ${escapeHtml(payload.phone || 'Not provided')}</p>` +
    `<p><strong>Message:</strong></p><p>${escapeHtml(payload.message).replace(/\n/g, '<br />')}</p>`;

  return { html, text };
}

export async function POST(request: Request): Promise<NextResponse> {
  let requestPayload: unknown;

  try {
    requestPayload = await request.json();
  } catch {
    return NextResponse.json({ detail: 'Invalid contact request payload' }, { status: 400 });
  }

  const payload = normalizePayload(requestPayload);
  if (!payload) {
    return NextResponse.json({ detail: 'Name, valid email, and message are required' }, { status: 422 });
  }

  const recipient = getContactRecipient();
  const email = buildContactEmail(payload);
  const delivery = await sendResendEmail({
    to: recipient,
    subject: `Cruizn Clean contact request from ${payload.fullName}`,
    html: email.html,
    text: email.text,
  });

  if (!delivery.ok) {
    const statusCode = delivery.reason === 'missing_configuration' || delivery.reason === 'missing_recipient' ? 503 : 502;
    return NextResponse.json({ detail: delivery.detail }, { status: statusCode });
  }

  return NextResponse.json({ status: 'accepted' });
}
