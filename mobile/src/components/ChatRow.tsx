import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../design/theme';
import { spacing, brandColors } from '../design/tokens';

interface ChatRowProps {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  onDelete: (id: string) => void;
}

export function ChatRow({ id, name, lastMessage, time, unreadCount = 0, onDelete }: ChatRowProps) {
  const { colors } = useTheme();

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteActionContainer}>
        <Animated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>
          <Pressable style={styles.deleteButton} onPress={() => onDelete(id)}>
            <Ionicons name="trash" size={24} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} rightThreshold={40}>
      <Pressable style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadDotContainer}>
              <View style={styles.unreadDot} />
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.timeText, { color: unreadCount > 0 ? brandColors.electricViolet : colors.text.placeholder }]}>{time}</Text>
          </View>
          <Text style={[styles.messageText, { color: unreadCount > 0 ? colors.text.primary : colors.text.secondary, fontFamily: unreadCount > 0 ? 'PlusJakartaSans-700Bold' : 'PlusJakartaSans-500Medium' }]} numberOfLines={2}>
            {lastMessage}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(139, 143, 168, 0.2)', // generic placeholder
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 20,
    color: '#8B8FA8',
  },
  unreadDotContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 2,
    borderRadius: 10,
  },
  unreadDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: brandColors.electricViolet,
    borderWidth: 2,
    borderColor: '#FFFFFF', // We can't know background dynamically easily without context, but since it's on primary, we could pass it or just make it solid.
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  nameText: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 16,
    flex: 1,
    marginRight: spacing.sm,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteActionContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: brandColors.coralPink,
  },
  deleteAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
