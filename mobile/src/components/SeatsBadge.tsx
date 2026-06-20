import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors } from '../design/tokens';
import { typography } from '../design/typography';

function hexToRGBA(hex: string, alpha: number) {
  if (!hex || hex.length < 7) return 'rgba(0,0,0,0.1)';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface SeatsBadgeProps {
  seatsLeft: number;
  style?: any;
}

export function SeatsBadge({ seatsLeft, style }: SeatsBadgeProps) {
  let color: string = brandColors.mintGreen;

  if (seatsLeft === 0) {
    color = brandColors.electricViolet;
  } else if (seatsLeft === 1) {
    color = brandColors.amber;
  }

  const bg = hexToRGBA(color, 0.15);

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]} accessible accessibilityRole="text" accessibilityLabel={seatsLeft === 0 ? 'No seats available' : `${seatsLeft} seats available`}>
      <Text style={[styles.text, { color }]}>
        {seatsLeft === 0 ? 'Full' : `${seatsLeft} left`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-end', // align right inside its flex container by default
  },
  text: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: typography.label.fontSize,
  },
});
