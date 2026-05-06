import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';

interface ResendErrorPayload {
  message?: unknown;
  name?: unknown;
}

function getEnvValue(name: string): string {
  return process.env[name]?.trim() || '';
}

function getBearerToken(request: Request): string {
  const authorization = request.headers.get('authorization') || '';
  const [scheme, token] = authorization.split(/\s+/, 2);

  return scheme.toLowerCase() === 'bearer' ? token?.trim() || '' : '';
}

function sanitizeMessage(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const compact = value.replace(/\s+/g, ' ').trim();
  return compact ? compact.slice(0, 240) : fallback;
}

async function getResendErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ResendErrorPayload;
    return sanitizeMessage(payload.message || payload.name, response.statusText || 'Resend request failed');
  } catch {
    return sanitizeMessage(response.statusText, 'Resend request failed');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const expectedToken = getEnvValue('EMAIL_TEST_TOKEN');
  if (!expectedToken) {
    return NextResponse.json({ ok: false, detail: 'Email test endpoint is not configured' }, { status: 503 });
  }

  if (getBearerToken(request) !== expectedToken) {
    return NextResponse.json({ ok: false, detail: 'Unauthorized' }, { status: 401 });
  }

  const resendApiKey = getEnvValue('RESEND_API_KEY');
  const toAddress = getEnvValue('RESEND_TEST_TO');
  const fromAddress = getEnvValue('EMAIL_FROM');
  const replyToAddress = getEnvValue('EMAIL_REPLY_TO');

  if (!resendApiKey || !toAddress || !fromAddress) {
    return NextResponse.json({ ok: false, detail: 'Required email test configuration is missing' }, { status: 503 });
  }

  const response = await fetch(RESEND_EMAILS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [toAddress],
      ...(replyToAddress ? { reply_to: replyToAddress } : {}),
      subject: 'Cruizn Clean Resend smoke test',
      html: '<p>This is a Cruizn Clean Resend smoke test from the web runtime.</p>',
      text: 'This is a Cruizn Clean Resend smoke test from the web runtime.',
    }),
  });

  if (!response.ok) {
    const detail = await getResendErrorMessage(response);
    return NextResponse.json({ ok: false, status: response.status, detail }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
