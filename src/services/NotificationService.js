// Notification Service - Integrates Firebase Cloud Messaging and Twilio SMS
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { SMSService } from '../../config/twilio-config.js';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.isSupported = false;
    this.init();
  }

  async init() {
    try {
      // Check if browser supports notifications
      if ('Notification' in window && 'serviceWorker' in navigator) {
        this.messaging = getMessaging();
        this.isSupported = true;
        
        // Request notification permission
        await this.requestPermission();
        
        // Get FCM token
        await this.getToken();
        
        // Listen for messages
        this.listenForMessages();
        
        console.log('Notification service initialized successfully');
      } else {
        console.log('Notifications not supported in this browser');
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getToken() {
    try {
      if (!this.messaging) return null;
      
      const token = await getToken(this.messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // You can get this from Firebase Console
      });
      
      if (token) {
        console.log('FCM Token:', token);
        // Store token in localStorage for later use
        localStorage.setItem('fcmToken', token);
        return token;
      } else {
        console.log('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  listenForMessages() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('Message received:', payload);
      
      // Show notification
      this.showNotification(payload.notification);
    });
  }

  showNotification(notification) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(notification.title, {
        body: notification.body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'neersetu-alert',
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  // Send emergency alert via SMS and push notification
  async sendEmergencyAlert(village, riskLevel, message) {
    const alertData = {
      village,
      riskLevel,
      message,
      timestamp: new Date().toISOString()
    };

    try {
      // Send SMS via Twilio
      const smsResult = await SMSService.sendEmergencyAlert(village, riskLevel, message);
      
      // Send push notification (if supported)
      if (this.isSupported) {
        await this.sendPushNotification({
          title: `🚨 Emergency Alert - ${village}`,
          body: `Risk Level: ${riskLevel}\n${message}`,
          data: alertData
        });
      }

      return {
        success: true,
        sms: smsResult,
        push: this.isSupported
      };
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send push notification
  async sendPushNotification(notification) {
    try {
      // This would typically be sent from your backend
      // For now, we'll just show a local notification
      this.showNotification(notification);
      return { success: true };
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send health report confirmation
  async sendHealthReportConfirmation(phoneNumber, reportId) {
    const message = `✅ Health Report Submitted\nReport ID: ${reportId}\nThank you for reporting. We'll monitor the situation.`;
    
    try {
      const result = await SMSService.sendSMS(phoneNumber, message);
      return result;
    } catch (error) {
      console.error('Failed to send health report confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  // Send water quality alert
  async sendWaterQualityAlert(village, qualityData) {
    const message = `💧 Water Quality Alert - ${village}\npH: ${qualityData.pH}\nTurbidity: ${qualityData.turbidity}\nStatus: ${qualityData.status}`;
    
    try {
      const result = await SMSService.sendSMS("+1234567890", message); // Replace with actual number
      return result;
    } catch (error) {
      console.error('Failed to send water quality alert:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationService();

