import test from 'node:test';
import assert from 'node:assert/strict';
import { decideFollowUp } from './auth_flow.js';

test('on-site work order with photos still needs technician follow-up when asked', () => {
  const snapshot = decideFollowUp({
    email: 'maya@fieldops.example',
    password: 'correct horse battery staple',
    name: 'Maya',
    captchaWidgetRecordId: 'widget-record-id',
    captchaToken: 'token',
    dispatchStatus: 'on_site',
    workOrderPhotoCount: 3,
    followUpNeeded: true
  });

  assert.equal(snapshot.needsTechnicianFollowUp, true);
  assert.equal(snapshot.sessionNote, 'Technician follow-up is required before closing the work order.');
});
