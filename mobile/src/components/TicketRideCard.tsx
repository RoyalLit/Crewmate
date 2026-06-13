import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { spacing, brandColors } from '../design/tokens';

interface TicketRideCardProps {
  status: 'active' | 'completed' | 'cancelled';
  date: string;
  time: string;
  from: string;
  to: string;
  price: string;
  driver: string;
}

export function TicketRideCard({ status, date, time, from, to, price, driver }: TicketRideCardProps) {
  const { colors, isDark } = useTheme();

  const getStatusColor = () => {
    if (status === 'active') return brandColors.mintGreen;
    if (status === 'completed') return brandColors.electricViolet;
    return brandColors.coralPink;
  };

  const statusColor = getStatusColor();
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const dualToneBg = isDark ? `${statusColor}15` : `${statusColor}08`;

  return (
    <View style={styles.container}>
      
      {/* Top Ticket Portion */}
      <View style={[styles.ticketTop, { backgroundColor: colors.background.card, borderColor }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.dateText, { color: colors.text.secondary }]}>{date} • {time}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeCol}>
            <Text style={[styles.cityText, { color: colors.text.primary }]}>{from}</Text>
            <Text style={[styles.timeText, { color: colors.text.secondary }]}>Departure</Text>
          </View>
          <View style={styles.routeArrow}>
            <Ionicons name="arrow-forward" size={24} color={colors.text.placeholder} />
          </View>
          <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
            <Text style={[styles.cityText, { color: colors.text.primary }]}>{to}</Text>
            <Text style={[styles.timeText, { color: colors.text.secondary }]}>Arrival</Text>
          </View>
        </View>
      </View>

      {/* Perforation Line and Cutouts */}
      <View style={styles.perforationContainer}>
        {/* Top half gets card background, bottom half gets dual-tone background */}
        <View style={[styles.perfHalf, { backgroundColor: colors.background.card }]} />
        <View style={[styles.perfHalf, { backgroundColor: dualToneBg }]} />
        
        <View style={styles.dashedLineWrapper}>
          <View style={[styles.dashedLine, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
        </View>

        {/* The cutouts MUST match the page background perfectly. Without shadows, this is a 100% match. */}
        <View style={[styles.cutout, styles.cutoutLeft, { backgroundColor: colors.background.primary }]} />
        <View style={[styles.cutout, styles.cutoutRight, { backgroundColor: colors.background.primary }]} />
      </View>

      {/* Bottom Ticket Portion (Dual Tone) */}
      <View style={[styles.ticketBottom, { backgroundColor: dualToneBg, borderColor }]}>
        <View style={styles.driverInfo}>
          <View style={[styles.driverAvatar, { backgroundColor: statusColor }]}>
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.driverName, { color: colors.text.primary }]}>{driver}</Text>
        </View>
        <Text style={[styles.priceText, { color: colors.text.primary }]}>{price}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    // Removed ALL shadows so the cutout color matches the page background exactly.
  },
  ticketTop: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  perforationContainer: {
    height: 30,
    position: 'relative',
    // NO borders! So no border peeks behind the cutouts.
  },
  perfHalf: {
    flex: 1,
  },
  dashedLineWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  dashedLine: {
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: -1,
  },
  cutout: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    top: 0,
    zIndex: 10,
  },
  cutoutLeft: {
    left: -15, // exactly centered on the edge
  },
  cutoutRight: {
    right: -15, // exactly centered on the edge
  },
  ticketBottom: {
    padding: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderTopWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dateText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeCol: {
    flex: 1,
  },
  cityText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 24,
    marginBottom: 4,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 13,
  },
  routeArrow: {
    paddingHorizontal: spacing.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 16,
  },
  priceText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 20,
  },
});
