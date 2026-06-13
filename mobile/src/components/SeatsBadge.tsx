import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { brandColors } from '../design/tokens';

interface SeatsBadgeProps {
  seatsLeft: number;
}

export function SeatsBadge({ seatsLeft }: SeatsBadgeProps) {
  let color: string = brandColors.mintGreen;
  let bg: string = '#E8F5F0';

  if (seatsLeft === 0) {
    color = brandColors.electricViolet;
    bg = '#F0EFFF';
  } else if (seatsLeft === 1) {
    color = brandColors.amber;
    bg = '#FFF6E8';
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
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
    alignSelf: 'flex-end', // align right inside its flex container
  },
  text: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 12,
  },
});
