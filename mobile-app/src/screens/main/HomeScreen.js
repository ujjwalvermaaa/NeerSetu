import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';
import StatsCard from '../../components/StatsCard';
import RiskIndexCard from '../../components/RiskIndexCard';
import AlertCard from '../../components/AlertCard';
import QuickActionCard from '../../components/QuickActionCard';
import AwarenessTipCard from '../../components/AwarenessTipCard';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { isOnline, isOfflineMode } = useOffline();
  
  const [refreshing, setRefreshing] = useState(false);
  const [riskIndex, setRiskIndex] = useState(150);
  const [riskLevel, setRiskLevel] = useState('moderate');
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    waterQualityScore: 85,
    healthCases: 0,
    awarenessScore: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API calls
      setRiskIndex(Math.floor(Math.random() * 500));
      setRiskLevel(getRiskLevel(riskIndex));
      setAlerts([
        {
          id: '1',
          type: 'water_contamination',
          title: 'Water Quality Alert',
          message: 'High bacterial count detected in your area',
          timestamp: new Date().toISOString(),
          severity: 'high',
        },
        {
          id: '2',
          type: 'health_reminder',
          title: 'Health Check Reminder',
          message: 'Remember to report any symptoms today',
          timestamp: new Date().toISOString(),
          severity: 'low',
        },
      ]);
      setStats({
        totalReports: 12,
        waterQualityScore: 85,
        healthCases: 3,
        awarenessScore: 75,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getRiskLevel = (index) => {
    if (index <= 100) return 'low';
    if (index <= 200) return 'moderate';
    if (index <= 300) return 'high';
    if (index <= 400) return 'very_high';
    return 'critical';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return theme.colors.safe;
      case 'moderate': return theme.colors.warning;
      case 'high': return theme.colors.alert;
      case 'very_high': return theme.colors.high;
      case 'critical': return theme.colors.critical;
      default: return theme.colors.safe;
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case 'low': return t('home.lowRisk');
      case 'moderate': return t('home.moderateRisk');
      case 'high': return t('home.highRisk');
      case 'very_high': return t('home.veryHighRisk');
      case 'critical': return t('home.criticalRisk');
      default: return t('home.lowRisk');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'health_report',
      title: t('home.quickReport'),
      subtitle: 'Report symptoms',
      icon: 'medical',
      color: theme.colors.health,
      onPress: () => navigation.navigate('HealthReport'),
    },
    {
      id: 'water_test',
      title: 'Test Water',
      subtitle: 'Check quality',
      icon: 'water',
      color: theme.colors.water,
      onPress: () => navigation.navigate('WaterReport'),
    },
    {
      id: 'chatbot',
      title: 'Ask AI',
      subtitle: 'Get help',
      icon: 'chatbubble',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Chatbot'),
    },
    {
      id: 'emergency',
      title: 'Emergency',
      subtitle: 'Get help now',
      icon: 'call',
      color: theme.colors.error,
      onPress: () => navigation.navigate('EmergencyContacts'),
    },
  ];

  const awarenessTips = [
    {
      id: '1',
      title: 'Boil Water Before Drinking',
      description: 'Always boil water for at least 1 minute to kill harmful bacteria',
      icon: 'flame',
      color: theme.colors.warning,
    },
    {
      id: '2',
      title: 'Wash Hands Regularly',
      description: 'Wash hands with soap for at least 20 seconds before eating',
      icon: 'hand-left',
      color: theme.colors.primary,
    },
    {
      id: '3',
      title: 'Store Water Safely',
      description: 'Keep water in clean, covered containers away from contamination',
      icon: 'shield-checkmark',
      color: theme.colors.safe,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    welcomeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    welcomeText: {
      flex: 1,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.sm,
    },
    statusText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    alertsContainer: {
      marginBottom: theme.spacing.lg,
    },
    tipsContainer: {
      marginBottom: theme.spacing.lg,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    viewAllText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
      marginRight: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeText}>
            <Text style={styles.greeting}>
              {t('home.welcome')}, {user?.username || 'User'}!
            </Text>
            <Text style={styles.subtitle}>
              {t('home.subtitle')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={20} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? theme.colors.safe : theme.colors.alert }
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'} {isOfflineMode ? '(Offline Mode)' : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Index Card */}
        <View style={styles.section}>
          <RiskIndexCard
            riskIndex={riskIndex}
            riskLevel={riskLevel}
            riskLabel={getRiskLabel(riskLevel)}
            riskColor={getRiskColor(riskLevel)}
            village={user?.village || 'Your Village'}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.statsContainer}>
            <StatsCard
              title="Total Reports"
              value={stats.totalReports}
              icon="document-text"
              color={theme.colors.primary}
              style={{ width: (width - theme.spacing.lg * 3) / 2 }}
            />
            <StatsCard
              title="Water Quality"
              value={`${stats.waterQualityScore}%`}
              icon="water"
              color={theme.colors.water}
              style={{ width: (width - theme.spacing.lg * 3) / 2 }}
            />
            <StatsCard
              title="Health Cases"
              value={stats.healthCases}
              icon="medical"
              color={theme.colors.health}
              style={{ width: (width - theme.spacing.lg * 3) / 2 }}
            />
            <StatsCard
              title="Awareness Score"
              value={`${stats.awarenessScore}%`}
              icon="trophy"
              color={theme.colors.secondary}
              style={{ width: (width - theme.spacing.lg * 3) / 2 }}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                title={action.title}
                subtitle={action.subtitle}
                icon={action.icon}
                color={action.color}
                onPress={action.onPress}
                style={{ width: (width - theme.spacing.lg * 3) / 2 }}
              />
            ))}
          </View>
        </View>

        {/* Latest Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.latestAlerts')}</Text>
          <View style={styles.alertsContainer}>
            {alerts.slice(0, 2).map((alert) => (
              <AlertCard
                key={alert.id}
                title={alert.title}
                message={alert.message}
                severity={alert.severity}
                timestamp={alert.timestamp}
                onPress={() => navigation.navigate('Alerts')}
              />
            ))}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Alerts')}
            >
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Awareness Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.awarenessTips')}</Text>
          <View style={styles.tipsContainer}>
            {awarenessTips.slice(0, 2).map((tip) => (
              <AwarenessTipCard
                key={tip.id}
                title={tip.title}
                description={tip.description}
                icon={tip.icon}
                color={tip.color}
                onPress={() => navigation.navigate('Awareness')}
              />
            ))}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Awareness')}
            >
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;