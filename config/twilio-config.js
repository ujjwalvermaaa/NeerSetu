// Twilio Configuration
// Your Twilio credentials are already configured

const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "your_twilio_account_sid",
  authToken: process.env.TWILIO_AUTH_TOKEN || "your_twilio_auth_token",
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
  enabled: true
};

// Twilio API endpoints
export const TWILIO_ENDPOINTS = {
  sendSMS: `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`,
  getMessages: `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`
};

// SMS Service
export class SMSService {
  static async sendSMS(to, message) {
    if (!twilioConfig.enabled) {
      console.log('SMS disabled - would send:', { to, message });
      return { success: true, message: 'SMS simulated' };
    }

    try {
      const response = await fetch(TWILIO_ENDPOINTS.sendSMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${twilioConfig.accountSid}:${twilioConfig.authToken}`)}`
        },
        body: new URLSearchParams({
          To: to,
          From: twilioConfig.phoneNumber,
          Body: message
        })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        throw new Error(`SMS failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('SMS Error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendEmergencyAlert(village, riskLevel, message) {
    const emergencyMessage = `🚨 NEERSETU ALERT 🚨\nVillage: ${village}\nRisk Level: ${riskLevel}\nMessage: ${message}\n\nTake immediate action!`;
    
    // For demo, we'll send to a test number
    // In production, you'd send to actual village contacts
    return await this.sendSMS("+1234567890", emergencyMessage);
  }
}

export default twilioConfig;

