import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

const LanguageContext = createContext();

const translations = {
  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      retry: 'Retry',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
    },
    // Navigation
    navigation: {
      home: 'Home',
      reports: 'Reports',
      water: 'Water Quality',
      awareness: 'Awareness',
      chatbot: 'Chatbot',
      alerts: 'Alerts',
      analytics: 'Analytics',
      settings: 'Settings',
      profile: 'Profile',
    },
    // Authentication
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      phone: 'Phone Number',
      village: 'Village',
      state: 'State',
      district: 'District',
      role: 'Role',
      villager: 'Villager',
      asha: 'ASHA Worker',
      official: 'Health Official',
      admin: 'Administrator',
      loginSuccess: 'Login successful',
      loginError: 'Login failed',
      registerSuccess: 'Registration successful',
      registerError: 'Registration failed',
    },
    // Home Screen
    home: {
      welcome: 'Welcome to NeerSetu',
      subtitle: 'Smart Community Health Monitoring',
      riskIndex: 'Risk Index',
      currentRisk: 'Current Risk Level',
      lowRisk: 'Low Risk',
      moderateRisk: 'Moderate Risk',
      highRisk: 'High Risk',
      veryHighRisk: 'Very High Risk',
      criticalRisk: 'Critical Risk',
      latestAlerts: 'Latest Alerts',
      quickReport: 'Quick Report',
      awarenessTips: 'Awareness Tips',
      waterQuality: 'Water Quality',
      healthStatus: 'Health Status',
      viewAll: 'View All',
    },
    // Reports
    reports: {
      title: 'Health Reports',
      newReport: 'New Report',
      healthReport: 'Health Report',
      waterReport: 'Water Report',
      symptoms: 'Symptoms',
      fever: 'Fever',
      diarrhea: 'Diarrhea',
      vomiting: 'Vomiting',
      nausea: 'Nausea',
      headache: 'Headache',
      stomachPain: 'Stomach Pain',
      severity: 'Severity',
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
      duration: 'Duration (days)',
      description: 'Description',
      voiceNote: 'Voice Note',
      image: 'Image',
      location: 'Location',
      submit: 'Submit Report',
      submitted: 'Report Submitted',
      error: 'Failed to submit report',
    },
    // Water Quality
    water: {
      title: 'Water Quality',
      currentQuality: 'Current Water Quality',
      ph: 'pH Level',
      turbidity: 'Turbidity',
      bacteria: 'Bacterial Count',
      oxygen: 'Dissolved Oxygen',
      nitrates: 'Nitrates',
      phosphates: 'Phosphates',
      heavyMetals: 'Heavy Metals',
      chlorine: 'Chlorine Residual',
      fluoride: 'Fluoride',
      arsenic: 'Arsenic',
      safe: 'Safe',
      unsafe: 'Unsafe',
      testWater: 'Test Water',
      uploadImage: 'Upload Test Strip Image',
      qualityScore: 'Quality Score',
      recommendations: 'Recommendations',
    },
    // Awareness
    awareness: {
      title: 'Health Awareness',
      tips: 'Health Tips',
      hygiene: 'Hygiene',
      waterSafety: 'Water Safety',
      diseasePrevention: 'Disease Prevention',
      emergency: 'Emergency Contacts',
      quiz: 'Health Quiz',
      badges: 'Badges',
      achievements: 'Achievements',
      learnMore: 'Learn More',
      watchVideo: 'Watch Video',
      readArticle: 'Read Article',
    },
    // Chatbot
    chatbot: {
      title: 'Health Assistant',
      placeholder: 'Ask me about health...',
      suggestions: 'Quick Questions',
      commonQuestions: 'Common Questions',
      send: 'Send',
      typing: 'Typing...',
      error: 'Sorry, I could not understand. Please try again.',
      suggestionsList: [
        'What are the symptoms of diarrhea?',
        'How to purify water?',
        'When to see a doctor?',
        'How to prevent water-borne diseases?',
      ],
    },
    // Alerts
    alerts: {
      title: 'Alerts',
      newAlert: 'New Alert',
      highRisk: 'High Risk Alert',
      waterContamination: 'Water Contamination Alert',
      outbreakWarning: 'Outbreak Warning',
      emergency: 'Emergency Alert',
      acknowledged: 'Acknowledged',
      pending: 'Pending',
      read: 'Mark as Read',
      acknowledge: 'Acknowledge',
      noAlerts: 'No alerts at the moment',
    },
    // Analytics
    analytics: {
      title: 'Analytics',
      healthTrends: 'Health Trends',
      waterQualityTrends: 'Water Quality Trends',
      riskAnalysis: 'Risk Analysis',
      weeklyReport: 'Weekly Report',
      monthlyReport: 'Monthly Report',
      exportData: 'Export Data',
      generateReport: 'Generate Report',
      cases: 'Cases',
      trends: 'Trends',
      comparison: 'Comparison',
    },
    // Settings
    settings: {
      title: 'Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      language: 'Language',
      theme: 'Theme',
      privacy: 'Privacy',
      about: 'About',
      help: 'Help & Support',
      feedback: 'Feedback',
      version: 'Version',
      logout: 'Logout',
      enableNotifications: 'Enable Notifications',
      enableLocation: 'Enable Location',
      enableVoice: 'Enable Voice Input',
      dataUsage: 'Data Usage',
      offlineMode: 'Offline Mode',
    },
  },
  hi: {
    // Hindi translations
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
      save: 'सहेजें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      retry: 'पुनः प्रयास करें',
      back: 'वापस',
      next: 'अगला',
      done: 'हो गया',
      yes: 'हाँ',
      no: 'नहीं',
      ok: 'ठीक है',
    },
    navigation: {
      home: 'होम',
      reports: 'रिपोर्ट्स',
      water: 'जल गुणवत्ता',
      awareness: 'जागरूकता',
      chatbot: 'चैटबॉट',
      alerts: 'अलर्ट्स',
      analytics: 'विश्लेषण',
      settings: 'सेटिंग्स',
      profile: 'प्रोफाइल',
    },
    auth: {
      login: 'लॉगिन',
      register: 'रजिस्टर',
      logout: 'लॉगआउट',
      username: 'उपयोगकर्ता नाम',
      email: 'ईमेल',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      phone: 'फोन नंबर',
      village: 'गाँव',
      state: 'राज्य',
      district: 'जिला',
      role: 'भूमिका',
      villager: 'ग्रामीण',
      asha: 'आशा कार्यकर्ता',
      official: 'स्वास्थ्य अधिकारी',
      admin: 'प्रशासक',
      loginSuccess: 'लॉगिन सफल',
      loginError: 'लॉगिन असफल',
      registerSuccess: 'रजिस्ट्रेशन सफल',
      registerError: 'रजिस्ट्रेशन असफल',
    },
    home: {
      welcome: 'नीरसेतु में आपका स्वागत है',
      subtitle: 'स्मार्ट सामुदायिक स्वास्थ्य निगरानी',
      riskIndex: 'जोखिम सूचकांक',
      currentRisk: 'वर्तमान जोखिम स्तर',
      lowRisk: 'कम जोखिम',
      moderateRisk: 'मध्यम जोखिम',
      highRisk: 'उच्च जोखिम',
      veryHighRisk: 'बहुत उच्च जोखिम',
      criticalRisk: 'गंभीर जोखिम',
      latestAlerts: 'नवीनतम अलर्ट्स',
      quickReport: 'त्वरित रिपोर्ट',
      awarenessTips: 'जागरूकता सुझाव',
      waterQuality: 'जल गुणवत्ता',
      healthStatus: 'स्वास्थ्य स्थिति',
      viewAll: 'सभी देखें',
    },
    // Add more Hindi translations as needed
  },
  as: {
    // Assamese translations
    common: {
      loading: 'লোড হৈ আছে...',
      error: 'ভুল',
      success: 'সফল',
      cancel: 'বাতিল কৰক',
      confirm: 'নিশ্চিত কৰক',
      save: 'সংৰক্ষণ কৰক',
      edit: 'সম্পাদনা কৰক',
      delete: 'মুচি পেলাওক',
      retry: 'পুনৰ চেষ্টা কৰক',
      back: 'পিছলৈ',
      next: 'পৰৱৰ্তী',
      done: 'সম্পন্ন',
      yes: 'হয়',
      no: 'নহয়',
      ok: 'ঠিক আছে',
    },
    navigation: {
      home: 'মূল পৃষ্ঠা',
      reports: 'ৰিপোৰ্টসমূহ',
      water: 'পানীৰ গুণাগুণ',
      awareness: 'সজাগতা',
      chatbot: 'চেটবট',
      alerts: 'সতৰ্কতাসমূহ',
      analytics: 'বিশ্লেষণ',
      settings: 'ছেটিংছ',
      profile: 'প্ৰফাইল',
    },
    // Add more Assamese translations as needed
  },
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  useEffect(() => {
    // Update RTL setting based on language
    const rtlLanguages = ['ar', 'he', 'fa'];
    setIsRTL(rtlLanguages.includes(currentLanguage));
    I18nManager.forceRTL(isRTL);
  }, [currentLanguage]);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language_preference');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      } else {
        // Use device locale
        const deviceLocale = 'en'; // You can get this from expo-localization
        setCurrentLanguage(deviceLocale);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      setCurrentLanguage(languageCode);
      await AsyncStorage.setItem('language_preference', languageCode);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations[currentLanguage];
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        // Fallback to English
        translation = translations.en;
        for (const fallbackKey of keys) {
          if (translation && translation[fallbackKey]) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }
    
    // Replace parameters in translation
    if (typeof translation === 'string') {
      return translation.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
    }
    
    return translation || key;
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
    ];
  };

  const value = {
    currentLanguage,
    isRTL,
    changeLanguage,
    t,
    getAvailableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
