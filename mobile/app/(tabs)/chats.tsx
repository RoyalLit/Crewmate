import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing, brandColors } from '../../src/design/tokens';
import { ChatRow } from '../../src/components/ChatRow';
import { useChatsList } from '../../src/api/chatsHooks';

export default function ChatsScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: chats, isLoading, refetch, isRefetching } = useChatsList();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, spacing.xl) }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Chats</Text>
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.electricViolet} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + spacing['2xl'],
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          {chats?.map((chat) => (
            <ChatRow 
              key={chat.id} 
              id={chat.id}
              name={chat.otherUser.name}
              lastMessage={chat.lastMessage}
              time={new Date(chat.time).toLocaleDateString()}
              unreadCount={chat.unreadCount}
              onPress={() => router.push(`/chat/${chat.rideId}/${chat.otherUser.id}`)}
            />
          ))}

          {(!chats || chats.length === 0) && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No conversations yet.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-800ExtraBold',
    fontSize: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
  },
});
