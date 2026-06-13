import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors } from '../design/tokens';

export type RideStatus = 'Active' | 'Pending' | 'Accepted' | 'Rejected' | 'Full' | 'Expired' | 'Cancelled';

interface StatusChipProps {
  status: RideStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  let backgroundColor = '';
  let textColor = '';

  switch (status) {
    case 'Active':
      backgroundColor = '#E8F5F0';
      textColor = brandColors.mintGreen;
      break;
    case 'Pending':
      backgroundColor = '#FFF6E8';
      textColor = brandColors.amber;
      break;
    case 'Accepted':
      backgroundColor = '#E8F5F0';
      textColor = brandColors.mintGreen;
      break;
    case 'Rejected':
      backgroundColor = '#FFF0F3';
      textColor = brandColors.coralPink;
      break;
    case 'Full':
      backgroundColor = '#F0EFFF';
      textColor = brandColors.electricViolet;
      break;
    case 'Expired':
    case 'Cancelled':
    default:
      backgroundColor = '#F3F4F6';
      textColor = '#8B8FA8';
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{status}</Text>
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
    fontSize: 12,
  },
});
