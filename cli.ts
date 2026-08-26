import { signupAndCreateSession } from './auth_flow.js';

const example = {
  email: 'maya@fieldops.example',
  password: 'correct horse battery staple',
  name: 'Maya',
  captchaWidgetRecordId: process.env.INFRAI_CAPTCHA_WIDGET_RECORD_ID ?? 'example-widget-record-id',
  captchaToken: 'example-token',
  dispatchStatus: 'on_site',
  workOrderPhotoCount: 2,
  followUpNeeded: true
};

signupAndCreateSession(example)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
