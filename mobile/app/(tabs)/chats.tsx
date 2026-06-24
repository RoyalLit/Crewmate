import React, { useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing, brandColors } from '../../src/design/tokens';
import { ChatRow } from '../../src/components/ChatRow';
import { EmptyState } from '../../src/components/EmptyState';
import { useChatsList } from '../../src/api/chatsHooks';

export default function ChatsScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: chats, isLoading, refetch, isRefetching } = useChatsList();

  const renderItem = useCallback(({ item: chat }: { item: any }) => (
    <ChatRow 
      key={chat.id} 
      id={chat.id}
      name={chat.otherUser.name}
      imageUrl={chat.otherUser.profilePhotoUrl}
      lastMessage={chat.lastMessage}
      time={new Date(chat.time).toLocaleDateString()}
      unreadCount={chat.unreadCount}
      onPress={() => router.push(`/chat/${chat.rideId}/${chat.otherUser.id}?name=${encodeURIComponent(chat.otherUser.name)}&rideInfo=${encodeURIComponent(chat.rideDetails.fromCity + ' to ' + chat.rideDetails.toCity)}`)}
    />
  ), [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {isLoading && !isRefetching ? (
        <View style={{ flex: 1 }}>
          <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.xl }]}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Chats</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={brandColors.electricViolet} />
          </View>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <View style={[styles.headerContainer, { paddingTop: spacing.xl }]}>
              <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Chats</Text>
            </View>
          }
          ListEmptyComponent={<EmptyState icon="chatbubbles-outline" title="No messages yet" subtitle="When you accept a ride request, you can chat here" />}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + spacing['2xl'],
            flexGrow: 1,
          }}
          contentInset={{ top: insets.top }}
          contentOffset={{ x: 0, y: -insets.top }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.interactive.primary} colors={[colors.interactive.primary]} progressViewOffset={insets.top} />}
        />
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

});
