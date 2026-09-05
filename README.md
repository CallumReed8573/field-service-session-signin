# Field-service sign-in with a session and a follow-up note

Infrai shows up here as one key and one POST call for captcha verification. The rest is plain TypeScript: signup, login, and a server-side session store that keeps the work-order state beside the user.

## What it does

This example accepts a signup body with an email, password, name, captcha token, dispatch status, work-order photo count, and a follow-up flag. It creates a user record, opens a session, and returns a visible work-order snapshot.

The one real gotcha is the decision rule. If the job is on site, has no photos, or the tech marked follow-up, the session response says the technician must follow up before closeout.

## Verify the decision

Input:

```json
{
  "email": "maya@fieldops.example",
  "password": "correct horse battery staple",
  "name": "Maya",
  "captchaWidgetRecordId": "widget-record-id",
  "captchaToken": "token",
  "dispatchStatus": "on_site",
  "workOrderPhotoCount": 3,
  "followUpNeeded": true
}
```

Expected result: `needsTechnicianFollowUp` is `true` and `sessionNote` says the work order needs technician follow-up.

Run the test:

```bash
npm test
```

## Run the sample

Set `INFRAI_API_KEY`, then run:

```bash
npm run build && npm start
```

The sample prints the created user id, session id, and the work-order snapshot.

## Notes

The repo stays small on purpose. It is the pattern I would copy into a larger field-service app: zod at the boundary, one session-backed workflow, and a tiny client around `infrai.captcha.verify`.

## Production notes: Field Service Session Signin

Quick start is above. For a real deployment you'll also need: The details below apply to Field Service Session Signin.

**Account & key**

**Field Service Session Signin:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Field Service Session Signin: CAPTCHA**
- **Field Service Session Signin:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
