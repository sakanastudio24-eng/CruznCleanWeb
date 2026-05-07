const RESEND_EMAILS_URL = 'https://api.resend.com/emails';

interface ResendErrorPayload {
  message?: unknown;
  name?: unknown;
}

interface ResendSuccessPayload {
  id?: unknown;
}

export interface SendResendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
}

export type SendResendEmailResult =
  | {
      ok: true;
      status: number;
      providerMessageId: string | null;
    }
  | {
      ok: false;
      status: number | null;
      detail: string;
      reason: 'missing_configuration' | 'missing_recipient' | 'provider_error' | 'network_error';
    };

function getEnvValue(name: string): string {
  return process.env[name]?.trim() || '';
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

async function getResendSuccessMessageId(response: Response): Promise<string | null> {
  try {
    const payload = (await response.json()) as ResendSuccessPayload;
    return typeof payload.id === 'string' && payload.id ? payload.id : null;
  } catch {
    return null;
  }
}

export async function sendResendEmail(input: SendResendEmailInput): Promise<SendResendEmailResult> {
  const resendApiKey = getEnvValue('RESEND_API_KEY');
  const fromAddress = getEnvValue('EMAIL_FROM');
  const replyToAddress = getEnvValue('EMAIL_REPLY_TO');
  const toAddress = input.to.trim();

  if (!toAddress) {
    return {
      ok: false,
      status: null,
      detail: 'Email recipient is missing',
      reason: 'missing_recipient',
    };
  }

  if (!resendApiKey || !fromAddress) {
    return {
      ok: false,
      status: null,
      detail: 'Required email configuration is missing',
      reason: 'missing_configuration',
    };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${resendApiKey}`,
    'Content-Type': 'application/json',
  };

  if (input.idempotencyKey) {
    headers['Idempotency-Key'] = input.idempotencyKey;
  }

  let response: Response;
  try {
    response = await fetch(RESEND_EMAILS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        ...(replyToAddress ? { reply_to: replyToAddress } : {}),
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
  } catch (error) {
    return {
      ok: false,
      status: null,
      detail: sanitizeMessage(error instanceof Error ? error.message : null, 'Resend request failed'),
      reason: 'network_error',
    };
  }

  if (!response.ok) {
    const detail = await getResendErrorMessage(response);
    return {
      ok: false,
      status: response.status,
      detail,
      reason: 'provider_error',
    };
  }

  return {
    ok: true,
    status: response.status,
    providerMessageId: await getResendSuccessMessageId(response),
  };
}
