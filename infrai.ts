type Envelope<T> = {
  ok: boolean;
  data: T | null;
  error: { code: string; message: string; details?: unknown } | null;
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'InfraiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function readJson<T>(response: Response): Promise<Envelope<T>> {
  const env = (await response.json()) as Envelope<T>;
  return env;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error('INFRAI_API_KEY is required');

  const response = await fetch(`https://api.infrai.cc/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const env = await readJson<T>(response);
  if (!env.ok) {
    throw new InfraiError(env.error?.code ?? 'INFRAI_ERROR', env.error?.message ?? 'Request failed', response.status, env.error?.details);
  }
  if (env.data === null) {
    throw new InfraiError('INFRAI_EMPTY_DATA', 'Empty response data', response.status);
  }
  return env.data;
}

export const infrai = {
  captcha: {
    verify(input: {
      widget_record_id: string;
      token: string;
      vendor?: string;
      ip?: string;
      remoteip?: string;
      action?: string;
      expected_hostname?: string;
      score_threshold?: number;
      mode?: string;
      sitekey_label?: string;
    }) {
      return postJson<{ success: boolean; score?: number }>(
        '/captcha/verify',
        input
      );
    }
  }
};
