import { z } from 'zod';
import { infrai, InfraiError } from './infrai.js';

const SignupBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  captchaWidgetRecordId: z.string().min(1),
  captchaToken: z.string().min(1),
  dispatchStatus: z.enum(['queued', 'assigned', 'en_route', 'on_site', 'done']),
  workOrderPhotoCount: z.number().int().nonnegative(),
  followUpNeeded: z.boolean()
});

export type SignupBody = z.infer<typeof SignupBody>;

export type WorkOrderSnapshot = {
  email: string;
  dispatchStatus: 'queued' | 'assigned' | 'en_route' | 'on_site' | 'done';
  needsTechnicianFollowUp: boolean;
  sessionNote: string;
};

export type SignupResult = {
  userId: string;
  sessionId: string;
  snapshot: WorkOrderSnapshot;
};

type SessionStore = Map<string, { userId: string; createdAt: string }>;

const users = new Map<string, { id: string; email: string; name: string; password: string }>();
const sessions: SessionStore = new Map();

function decideFollowUp(input: SignupBody): WorkOrderSnapshot {
  const needsTechnicianFollowUp = input.followUpNeeded || input.workOrderPhotoCount === 0 || input.dispatchStatus === 'on_site';
  const sessionNote = needsTechnicianFollowUp
    ? 'Technician follow-up is required before closing the work order.'
    : 'No follow-up is needed right now.';

  return {
    email: input.email,
    dispatchStatus: input.dispatchStatus,
    needsTechnicianFollowUp,
    sessionNote
  };
}

export async function signupAndCreateSession(raw: unknown): Promise<SignupResult> {
  const input = SignupBody.parse(raw);
  const captcha = await infrai.captcha.verify({
    widget_record_id: input.captchaWidgetRecordId,
    token: input.captchaToken,
    action: 'field-service-signup',
    score_threshold: 0.7
  });

  if (!captcha.success) {
    throw new InfraiError('CAPTCHA_REJECTED', 'Captcha verification did not pass', 422, captcha);
  }

  const userId = `usr_${Buffer.from(input.email).toString('hex').slice(0, 12)}`;
  users.set(input.email, { id: userId, email: input.email, name: input.name, password: input.password });

  const sessionId = `ses_${Buffer.from(`${input.email}:${input.dispatchStatus}`).toString('hex').slice(0, 16)}`;
  sessions.set(sessionId, { userId, createdAt: new Date().toISOString() });

  return {
    userId,
    sessionId,
    snapshot: decideFollowUp(input)
  };
}

export function verifySession(sessionId: string) {
  return sessions.get(sessionId) ?? null;
}

export function login(email: string, password: string) {
  const user = users.get(email);
  if (!user || user.password !== password) return null;
  return { userId: user.id };
}

export { decideFollowUp, SignupBody };
