import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ErrorBoundary } from 'react-error-boundary';

// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { OfflineProvider } from './src/contexts/OfflineContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDmWm_n1ZuxlaZhepI_nxwN73NNPS8fGAI",
  authDomain: "neersetu-df972.firebaseapp.com",
  projectId: "neersetu-df972",
  storageBucket: "neersetu-df972.firebasestorage.app",
  messagingSenderId: "775472732535",
  appId: "1:775472732535:web:39bc4530e46e34adbce972",
  measurementId: "G-TM2L0L62QM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong!</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Text style={styles.resetButton} onPress={resetErrorBoundary}>
        Try Again
      </Text>
    </View>
  );
}

// Loading Component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Loading NeerSetu...</Text>
    </View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App: Starting initialization...');
    
    // Initialize app
    const initializeApp = async () => {
      try {
        // Set up Firebase auth listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log('App: Auth state changed:', user ? 'User logged in' : 'User logged out');
          setUser(user);
          setLoading(false);
        });

        // Simulate app initialization time
        setTimeout(() => {
          console.log('App: Initialization complete');
          setIsReady(true);
        }, 2000);

        return unsubscribe;
      } catch (error) {
        console.error('App: Initialization error:', error);
        Alert.alert('Error', 'Failed to initialize app');
        setLoading(false);
      }
    };

    const unsubscribe = initializeApp();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!isReady || loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PaperProvider>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <OfflineProvider>
                <View style={styles.container}>
                  <AppNavigator />
                  <StatusBar style="auto" />
                </View>
              </OfflineProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});