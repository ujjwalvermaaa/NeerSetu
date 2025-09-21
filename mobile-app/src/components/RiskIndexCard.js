import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const RiskIndexCard = ({ riskIndex, riskLevel, riskLabel, riskColor, village }) => {
  const { theme } = useTheme();

  const getRiskGradient = (level) => {
    switch (level) {
      case 'low':
        return [theme.colors.safe, theme.colors.safe + '80'];
      case 'moderate':
        return [theme.colors.warning, theme.colors.warning + '80'];
      case 'high':
        return [theme.colors.alert, theme.colors.alert + '80'];
      case 'very_high':
        return [theme.colors.high, theme.colors.high + '80'];
      case 'critical':
        return [theme.colors.critical, theme.colors.critical + '80'];
      default:
        return [theme.colors.safe, theme.colors.safe + '80'];
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low':
        return 'checkmark-circle';
      case 'moderate':
        return 'warning';
      case 'high':
        return 'alert-circle';
      case 'very_high':
        return 'alert-triangle';
      case 'critical':
        return 'close-circle';
      default:
        return 'checkmark-circle';
    }
  };

  const getRiskDescription = (level) => {
    switch (level) {
      case 'low':
        return 'Your area is safe. Continue following health guidelines.';
      case 'moderate':
        return 'Be cautious. Monitor water quality and health symptoms.';
      case 'high':
        return 'High risk detected. Take preventive measures immediately.';
      case 'very_high':
        return 'Very high risk. Seek medical attention if symptoms appear.';
      case 'critical':
        return 'Critical risk. Emergency measures required.';
      default:
        return 'Risk level unknown.';
    }
  };

  const styles = StyleSheet.create({
    container: {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.lg,
    },
    gradient: {
      padding: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.surface + '30',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.surface,
      marginBottom: theme.spacing.xs,
    },
    village: {
      fontSize: 14,
      color: theme.colors.surface + 'CC',
    },
    riskContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    riskIndex: {
      fontSize: 48,
      fontWeight: 'bold',
      color: theme.colors.surface,
      marginBottom: theme.spacing.xs,
    },
    riskLabel: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.surface,
      marginBottom: theme.spacing.sm,
    },
    riskDescription: {
      fontSize: 14,
      color: theme.colors.surface + 'CC',
      textAlign: 'center',
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.surface + 'CC',
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getRiskGradient(riskLevel)}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getRiskIcon(riskLevel)}
              size={24}
              color={theme.colors.surface}
            />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Risk Index</Text>
            <Text style={styles.village}>{village}</Text>
          </View>
        </View>

        <View style={styles.riskContainer}>
          <Text style={styles.riskIndex}>{riskIndex}</Text>
          <Text style={styles.riskLabel}>{riskLabel}</Text>
          <Text style={styles.riskDescription}>
            {getRiskDescription(riskLevel)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Ionicons
            name="information-circle"
            size={16}
            color={theme.colors.surface + 'CC'}
          />
          <Text style={styles.footerText}>
            Risk Index Scale: 0-500 (Like AQI)
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default RiskIndexCard;
