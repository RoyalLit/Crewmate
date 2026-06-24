import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../design/theme';
import { brandColors } from '../design/tokens';
import { typography } from '../design/typography';

export type RideStatus = 'Active' | 'Pending' | 'Accepted' | 'Rejected' | 'Full' | 'Expired' | 'Cancelled' | 'active' | 'completed' | 'cancelled' | 'expired';

function hexToRGBA(hex: string, alpha: number) {
  if (!hex || hex.length < 7) return 'rgba(0,0,0,0.1)';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface StatusChipProps {
  status: RideStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const { colors } = useTheme();
  let displayStatus = status.charAt(0).toUpperCase() + status.slice(1) as RideStatus | 'Completed';
  let textColor = '';

  if (displayStatus === 'Expired') {
    displayStatus = 'Completed';
  }

  switch (displayStatus) {
    case 'Active':
    case 'Accepted':
      textColor = brandColors.mintGreen;
      break;
    case 'Pending':
      textColor = brandColors.amber;
      break;
    case 'Rejected':
      textColor = brandColors.coralPink;
      break;
    case 'Full':
      textColor = brandColors.electricViolet;
      break;
    case 'Completed':
      textColor = brandColors.electricViolet;
      break;
    case 'Cancelled':
    default:
      textColor = colors.text.placeholder;
      break;
  }

  const backgroundColor = hexToRGBA(textColor, 0.15);

  return (
    <View style={[styles.container, { backgroundColor }]} accessible accessibilityRole="text" accessibilityLabel={displayStatus}>
      <Text style={[styles.text, { color: textColor }]}>{displayStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: typography.label.fontSize,
  },
});
