# NeerSetu Mobile App

React Native mobile application for the NeerSetu Smart Community Health Monitoring System. This app provides a comprehensive platform for villagers, ASHA workers, and health officials to report health issues, monitor water quality, and receive alerts about potential outbreaks.

## 🚀 Features

### Core Functionality
- **User Authentication**: Login/Register with role-based access (Villager, ASHA Worker, Health Official, Admin)
- **Health Reporting**: Submit health reports with symptoms, severity, and multimedia support
- **Water Quality Monitoring**: Report and track water quality parameters
- **Real-time Alerts**: Receive push notifications for health alerts and warnings
- **Offline Support**: Work offline and sync data when connection is available
- **Multilingual Support**: English, Hindi, and Assamese language support

### Advanced Features
- **Voice Input**: Record voice notes for health reports
- **Image Capture**: Take photos of water test strips and symptoms
- **GPS Location**: Automatic location tagging for reports
- **Risk Assessment**: View current risk levels and health status
- **Awareness Content**: Health education and prevention tips
- **AI Chatbot**: Get health advice and information
- **Analytics Dashboard**: View health trends and statistics

## 📱 Screens

### Authentication
- **Login Screen**: User authentication with email/password
- **Register Screen**: New user registration with role selection

### Main Navigation
- **Home Screen**: Dashboard with risk index, quick actions, and alerts
- **Reports Screen**: View and manage health and water quality reports
- **Water Quality Screen**: Monitor water quality parameters and trends
- **Awareness Screen**: Health education content and tips
- **Chatbot Screen**: AI-powered health assistant
- **Alerts Screen**: View and manage health alerts
- **Analytics Screen**: Health trends and statistics (for officials)
- **Settings Screen**: App preferences and configuration
- **Profile Screen**: User profile management

### Forms
- **Health Report Form**: Submit detailed health reports
- **Water Report Form**: Report water quality measurements

### Awareness
- **Quiz Screen**: Interactive health quizzes
- **Badges Screen**: Achievement system
- **Emergency Contacts**: Emergency contact information

## 🛠️ Technical Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
- **React Native Paper**: Material Design components
- **SQLite**: Local database for offline storage
- **Expo Notifications**: Push notifications
- **Expo Location**: GPS location services
- **Expo Camera**: Camera and image capture
- **Expo AV**: Audio recording and playback
- **React Context**: State management
- **AsyncStorage**: Local data persistence

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup
1. **Navigate to mobile app directory**:
   ```bash
   cd /Users/ujjwal/Desktop/SIH/PROJECT/mobile-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the mobile app directory:

```env
# API Configuration
API_BASE_URL=http://localhost:5000
ML_SERVICE_URL=http://localhost:8000

# Notification Configuration
EXPO_PUSH_TOKEN=your_expo_push_token

# Map Configuration
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### App Configuration
The app configuration is managed in `app.json`:

```json
{
  "expo": {
    "name": "NeerSetu",
    "slug": "neersetu-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2196F3"
    },
    "platforms": ["ios", "android", "web"],
    "android": {
      "package": "com.neersetu.mobile",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.neersetu.mobile",
      "buildNumber": "1.0.0"
    }
  }
}
```

## 🎨 UI/UX Design

### Design Principles
- **Water-themed**: Blue and aqua color scheme representing water and health
- **Accessibility**: Large touch targets, clear typography, high contrast
- **Offline-first**: Works seamlessly without internet connection
- **Multilingual**: Supports local languages for better accessibility
- **Role-based**: Different interfaces for different user types

### Color Scheme
- **Primary**: #2196F3 (Blue)
- **Secondary**: #4CAF50 (Green)
- **Water**: #00BCD4 (Cyan)
- **Health**: #E91E63 (Pink)
- **Alert**: #FF5722 (Orange)
- **Safe**: #4CAF50 (Green)
- **Warning**: #FF9800 (Orange)
- **Critical**: #D32F2F (Red)

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Material Design with proper touch feedback
- **Forms**: Clear labels and validation
- **Navigation**: Bottom tabs with icons
- **Charts**: Water-themed data visualization

## 📊 Data Flow

### Offline-First Architecture
1. **Local Storage**: All data stored locally in SQLite
2. **Sync Queue**: Pending actions queued for sync
3. **Background Sync**: Automatic sync when online
4. **Conflict Resolution**: Handle data conflicts gracefully

### API Integration
- **Backend API**: RESTful API for data synchronization
- **ML Service**: AI predictions and risk assessment
- **Push Notifications**: Real-time alerts and updates
- **File Upload**: Images and voice notes

## 🔐 Security

### Authentication
- **JWT Tokens**: Secure authentication
- **Role-based Access**: Different permissions for different roles
- **Biometric Auth**: Fingerprint/Face ID support (future)

### Data Protection
- **Encryption**: Sensitive data encrypted at rest
- **Secure Storage**: Credentials stored securely
- **HTTPS**: All API calls over secure connections

## 📱 Platform Support

### Android
- **Minimum SDK**: 21 (Android 5.0)
- **Target SDK**: 33 (Android 13)
- **Permissions**: Camera, Location, Storage, Notifications

### iOS
- **Minimum Version**: iOS 11.0
- **Target Version**: iOS 16.0
- **Permissions**: Camera, Location, Notifications

### Web
- **Browsers**: Chrome, Firefox, Safari, Edge
- **PWA**: Progressive Web App support
- **Responsive**: Mobile-first design

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Android
1. **Build APK**:
   ```bash
   expo build:android
   ```

2. **Upload to Play Store**:
   - Generate signed APK
   - Upload to Google Play Console
   - Configure store listing

### iOS
1. **Build IPA**:
   ```bash
   expo build:ios
   ```

2. **Upload to App Store**:
   - Generate IPA file
   - Upload to App Store Connect
   - Submit for review

### Web
1. **Build Web App**:
   ```bash
   expo build:web
   ```

2. **Deploy**:
   - Upload to web server
   - Configure domain and SSL

## 📈 Performance

### Optimization
- **Lazy Loading**: Load screens on demand
- **Image Optimization**: Compress and cache images
- **Memory Management**: Proper cleanup and garbage collection
- **Bundle Size**: Minimize app size

### Monitoring
- **Crash Reporting**: Track and fix crashes
- **Performance Metrics**: Monitor app performance
- **User Analytics**: Track user behavior

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety (future)
- **JSDoc**: Documentation

## 📞 Support

### Documentation
- **API Docs**: Backend API documentation
- **Component Docs**: UI component documentation
- **User Guide**: End-user documentation

### Contact
- **Email**: support@neersetu.com
- **GitHub**: Issues and discussions
- **Community**: User forums and chat

## 📄 License

This project is part of the NeerSetu Smart Community Health Monitoring System for the Smart India Hackathon 2025.

---

**NeerSetu Mobile App v1.0** - Smart Community Health Monitoring
