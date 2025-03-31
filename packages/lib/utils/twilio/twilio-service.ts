const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);

class TwilioService {
  constructor() {}

  async sendVerificationCode(phone: string): Promise<Error | null> {
    try {
      await twilioClient.verify.services(verifyServiceSid).verifications.create({ to: phone, channel: 'sms' });

      return null;
    } catch (err: any) {
      console.error('Error:', err);
      return err;
    }
  }

  async checkVerificationCode(phone: string, code: string): Promise<Error | null> {
    try {
      const response = await twilioClient.verify.services(verifyServiceSid).verificationChecks.create({ to: phone, code });
      if (response.status !== 'approved') {
        throw new Error('Invalid verification code');
      }

      return null;
    } catch (err: any) {
      console.error('Error:', err);
      return err;
    }
  }
}

export default TwilioService;
