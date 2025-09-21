import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    registerForPushNotifications();
    loadStoredNotifications();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setNotifications(prev => [notification, ...prev]);
      storeNotification(notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap
      handleNotificationResponse(response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        setPermissionStatus(finalStatus);
        
        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return;
        }
        
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setExpoPushToken(token);
        
        // Store token for later use
        await AsyncStorage.setItem('expo_push_token', token);
      } else {
        console.log('Must use physical device for Push Notifications');
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const loadStoredNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('stored_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error);
    }
  };

  const storeNotification = async (notification) => {
    try {
      const updatedNotifications = [notification, ...notifications];
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(updatedNotifications.slice(0, 50))); // Keep last 50
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  };

  const sendLocalNotification = async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const sendScheduledNotification = async (title, body, triggerDate, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: triggerDate,
      });
    } catch (error) {
      console.error('Error sending scheduled notification:', error);
    }
  };

  const sendHealthAlert = async (alertData) => {
    const { type, message, riskLevel, village } = alertData;
    
    let title = 'Health Alert';
    let body = message;
    
    switch (type) {
      case 'outbreak':
        title = '🚨 Outbreak Alert';
        body = `High risk of water-borne disease in ${village}. ${message}`;
        break;
      case 'water_contamination':
        title = '💧 Water Contamination Alert';
        body = `Water contamination detected in ${village}. ${message}`;
        break;
      case 'high_risk':
        title = '⚠️ High Risk Alert';
        body = `High risk level detected in ${village}. ${message}`;
        break;
      case 'emergency':
        title = '🆘 Emergency Alert';
        body = `Emergency situation in ${village}. ${message}`;
        break;
    }

    await sendLocalNotification(title, body, {
      type,
      riskLevel,
      village,
      timestamp: new Date().toISOString(),
    });
  };

  const sendWaterQualityAlert = async (qualityData) => {
    const { village, qualityScore, parameters } = qualityData;
    
    const title = '💧 Water Quality Update';
    const body = `Water quality in ${village}: ${qualityScore}/100. Check details for more info.`;

    await sendLocalNotification(title, body, {
      type: 'water_quality',
      village,
      qualityScore,
      parameters,
      timestamp: new Date().toISOString(),
    });
  };

  const sendReminderNotification = async (type, message, delayMinutes = 60) => {
    const triggerDate = new Date();
    triggerDate.setMinutes(triggerDate.getMinutes() + delayMinutes);

    await sendScheduledNotification(
      'NeerSetu Reminder',
      message,
      triggerDate,
      { type, timestamp: new Date().toISOString() }
    );
  };

  const sendDailyHealthReminder = async () => {
    const messages = [
      'Remember to report any health symptoms today',
      'Check your water quality status',
      'Stay updated with health awareness tips',
      'Report any unusual health patterns in your area',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Schedule for tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    await sendScheduledNotification(
      'Daily Health Reminder',
      randomMessage,
      tomorrow,
      { type: 'daily_reminder' }
    );
  };

  const sendWeeklyReportReminder = async () => {
    const triggerDate = new Date();
    triggerDate.setDate(triggerDate.getDate() + 7);
    triggerDate.setHours(10, 0, 0, 0);

    await sendScheduledNotification(
      'Weekly Health Report',
      'Time to submit your weekly health and water quality report',
      triggerDate,
      { type: 'weekly_reminder' }
    );
  };

  const clearNotifications = async () => {
    try {
      setNotifications([]);
      await AsyncStorage.removeItem('stored_notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const updatedNotifications = notifications.map(notification =>
        notification.request.identifier === notificationId
          ? { ...notification, read: true }
          : notification
      );
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationResponse = (response) => {
    const { notification } = response;
    const { data } = notification.request.content;
    
    // Handle different notification types
    switch (data.type) {
      case 'outbreak':
      case 'water_contamination':
      case 'high_risk':
      case 'emergency':
        // Navigate to alerts screen
        break;
      case 'water_quality':
        // Navigate to water quality screen
        break;
      case 'daily_reminder':
        // Navigate to reports screen
        break;
      case 'weekly_reminder':
        // Navigate to analytics screen
        break;
      default:
        // Navigate to home screen
        break;
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const value = {
    expoPushToken,
    notifications,
    permissionStatus,
    sendLocalNotification,
    sendScheduledNotification,
    sendHealthAlert,
    sendWaterQualityAlert,
    sendReminderNotification,
    sendDailyHealthReminder,
    sendWeeklyReportReminder,
    clearNotifications,
    markNotificationAsRead,
    getUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
