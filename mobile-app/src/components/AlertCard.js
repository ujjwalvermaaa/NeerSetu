import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const AlertCard = ({ title, message, severity, timestamp, onPress, unread = false }) => {
  const { theme } = useTheme();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return theme.colors.safe;
      case 'moderate':
        return theme.colors.warning;
      case 'high':
        return theme.colors.alert;
      case 'critical':
        return theme.colors.critical;
      default:
        return theme.colors.primary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low':
        return 'information-circle';
      case 'moderate':
        return 'warning';
      case 'high':
        return 'alert-circle';
      case 'critical':
        return 'close-circle';
      default:
        return 'notifications';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: getSeverityColor(severity),
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: getSeverityColor(severity) + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    message: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textLight,
    },
    unreadIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    severityBadge: {
      backgroundColor: getSeverityColor(severity) + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    severityText: {
      fontSize: 12,
      fontWeight: '600',
      color: getSeverityColor(severity),
      textTransform: 'uppercase',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getSeverityIcon(severity)}
            size={16}
            color={getSeverityColor(severity)}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        {unread && <View style={styles.unreadIndicator} />}
      </View>

      <View style={styles.footer}>
        <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
        <View style={styles.severityBadge}>
          <Text style={styles.severityText}>{severity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AlertCard;
