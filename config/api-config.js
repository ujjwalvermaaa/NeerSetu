// NeerSetu API Configuration
// Replace the Firebase config with your actual values

export const API_CONFIG = {
  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "your_twilio_account_sid",
    authToken: process.env.TWILIO_AUTH_TOKEN || "your_twilio_auth_token",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
    enabled: true
  },

  // Firebase Configuration
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "your_firebase_api_key",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your_project.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "your_project_id",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your_project.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef1234567890",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
    enabled: true
  },

  // OpenStreetMap (No API key needed)
  maps: {
    provider: "openstreetmap",
    apiKey: "not_required",
    enabled: true,
    // Free tile server
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors"
  },

  // Weather API (Free tier)
  weather: {
    provider: "openweathermap",
    apiKey: "YOUR_OPENWEATHERMAP_API_KEY", // Optional - we can use mock data
    enabled: false, // Set to true if you want real weather data
    freeTierLimit: 1000 // calls per day
  },

  // ML Service
  ml: {
    baseUrl: "http://localhost:8000",
    enabled: true
  },

  // Backend API
  backend: {
    baseUrl: "http://localhost:5000",
    enabled: true
  }
};

// Environment-specific overrides
export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return {
      ...API_CONFIG,
      backend: {
        ...API_CONFIG.backend,
        baseUrl: process.env.REACT_APP_BACKEND_URL || "https://your-backend.herokuapp.com"
      },
      ml: {
        ...API_CONFIG.ml,
        baseUrl: process.env.REACT_APP_ML_URL || "https://your-ml-service.herokuapp.com"
      }
    };
  }
  
  return API_CONFIG;
};

export default API_CONFIG;
