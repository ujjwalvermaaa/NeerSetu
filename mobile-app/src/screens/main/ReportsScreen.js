import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/LanguageContext';

const ReportsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [reports, setReports] = useState([
    {
      id: '1',
      type: 'health',
      title: 'Health Report',
      date: '2025-01-11',
      status: 'submitted',
      symptoms: ['Fever', 'Diarrhea'],
    },
    {
      id: '2',
      type: 'water',
      title: 'Water Quality Report',
      date: '2025-01-10',
      status: 'pending',
      quality: 85,
    },
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.md,
    },
    reportCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    reportTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    reportDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    reportStatus: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.primary + '20',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    emptyButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    emptyButtonText: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const renderReport = ({ item }) => (
    <TouchableOpacity style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <View style={styles.reportStatus}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.reportDate}>{item.date}</Text>
      {item.symptoms && (
        <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>
          Symptoms: {item.symptoms.join(', ')}
        </Text>
      )}
      {item.quality && (
        <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>
          Quality Score: {item.quality}%
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('navigation.reports')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('HealthReport')}
          >
            <Ionicons name="add" size={24} color={theme.colors.surface} />
          </TouchableOpacity>
        </View>

        {reports.length > 0 ? (
          <FlatList
            data={reports}
            renderItem={renderReport}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>No reports yet</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('HealthReport')}
            >
              <Text style={styles.emptyButtonText}>Create First Report</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReportsScreen;
