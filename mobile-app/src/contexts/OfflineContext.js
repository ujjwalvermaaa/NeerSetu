import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    loadOfflineMode();
    loadPendingActions();

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline, pendingActions]);

  const loadOfflineMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('offline_mode');
      setIsOfflineMode(savedMode === 'true');
    } catch (error) {
      console.error('Error loading offline mode:', error);
    }
  };

  const loadPendingActions = async () => {
    try {
      const savedActions = await AsyncStorage.getItem('pending_actions');
      if (savedActions) {
        setPendingActions(JSON.parse(savedActions));
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const savePendingActions = async (actions) => {
    try {
      await AsyncStorage.setItem('pending_actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  };

  const toggleOfflineMode = async () => {
    try {
      const newMode = !isOfflineMode;
      setIsOfflineMode(newMode);
      await AsyncStorage.setItem('offline_mode', newMode.toString());
    } catch (error) {
      console.error('Error toggling offline mode:', error);
    }
  };

  const addPendingAction = async (action) => {
    try {
      const newAction = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action,
      };
      
      const updatedActions = [...pendingActions, newAction];
      setPendingActions(updatedActions);
      await savePendingActions(updatedActions);
    } catch (error) {
      console.error('Error adding pending action:', error);
    }
  };

  const removePendingAction = async (actionId) => {
    try {
      const updatedActions = pendingActions.filter(action => action.id !== actionId);
      setPendingActions(updatedActions);
      await savePendingActions(updatedActions);
    } catch (error) {
      console.error('Error removing pending action:', error);
    }
  };

  const syncPendingActions = async () => {
    if (pendingActions.length === 0) return;

    setSyncStatus('syncing');

    try {
      const successfulActions = [];
      const failedActions = [];

      for (const action of pendingActions) {
        try {
          // Simulate API call based on action type
          const success = await processAction(action);
          
          if (success) {
            successfulActions.push(action.id);
          } else {
            failedActions.push(action);
          }
        } catch (error) {
          console.error(`Error processing action ${action.id}:`, error);
          failedActions.push(action);
        }
      }

      // Remove successful actions
      const remainingActions = pendingActions.filter(
        action => !successfulActions.includes(action.id)
      );
      
      setPendingActions(remainingActions);
      await savePendingActions(remainingActions);

      setSyncStatus(successfulActions.length > 0 ? 'success' : 'error');
      
      // Reset sync status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Error syncing pending actions:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const processAction = async (action) => {
    // Simulate API call based on action type
    switch (action.type) {
      case 'health_report':
        return await submitHealthReport(action.data);
      case 'water_report':
        return await submitWaterReport(action.data);
      case 'update_profile':
        return await updateProfile(action.data);
      default:
        return false;
    }
  };

  const submitHealthReport = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/health-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      console.error('Error submitting health report:', error);
      return false;
    }
  };

  const submitWaterReport = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/water-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      console.error('Error submitting water report:', error);
      return false;
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const clearPendingActions = async () => {
    try {
      setPendingActions([]);
      await AsyncStorage.removeItem('pending_actions');
    } catch (error) {
      console.error('Error clearing pending actions:', error);
    }
  };

  const getOfflineData = async (key) => {
    try {
      const data = await AsyncStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting offline data for ${key}:`, error);
      return null;
    }
  };

  const setOfflineData = async (key, data) => {
    try {
      await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting offline data for ${key}:`, error);
    }
  };

  const value = {
    isOnline,
    isOfflineMode,
    pendingActions,
    syncStatus,
    toggleOfflineMode,
    addPendingAction,
    removePendingAction,
    syncPendingActions,
    clearPendingActions,
    getOfflineData,
    setOfflineData,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
