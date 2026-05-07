import { NextResponse } from 'next/server';

import { sendResendEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

function getEnvValue(name: string): string {
  return process.env[name]?.trim() || '';
}

function getBearerToken(request: Request): string {
  const authorization = request.headers.get('authorization') || '';
  const [scheme, token] = authorization.split(/\s+/, 2);

  return scheme.toLowerCase() === 'bearer' ? token?.trim() || '' : '';
}

export async function POST(request: Request): Promise<NextResponse> {
  const expectedToken = getEnvValue('EMAIL_TEST_TOKEN');
  if (!expectedToken) {
    return NextResponse.json({ ok: false, detail: 'Email test endpoint is not configured' }, { status: 503 });
  }

  if (getBearerToken(request) !== expectedToken) {
    return NextResponse.json({ ok: false, detail: 'Unauthorized' }, { status: 401 });
  }

  const toAddress = getEnvValue('RESEND_TEST_TO');

  if (!toAddress) {
    return NextResponse.json({ ok: false, detail: 'Required email test configuration is missing' }, { status: 503 });
  }

  const delivery = await sendResendEmail({
    to: toAddress,
    subject: 'Cruizn Clean Resend smoke test',
    html: '<p>This is a Cruizn Clean Resend smoke test from the web runtime.</p>',
    text: 'This is a Cruizn Clean Resend smoke test from the web runtime.',
  });

  if (!delivery.ok) {
    const statusCode = delivery.reason === 'missing_configuration' ? 503 : 502;
    return NextResponse.json({ ok: false, status: delivery.status, detail: delivery.detail }, { status: statusCode });
  }

  return NextResponse.json({ ok: true });
}
