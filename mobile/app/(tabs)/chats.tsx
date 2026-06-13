import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../src/design/theme';
import { TAB_BAR_HEIGHT, spacing } from '../../src/design/tokens';
import { ChatRow } from '../../src/components/ChatRow';

const INITIAL_CHATS = [
  { id: '1', name: 'Alex R.', lastMessage: 'Are we still meeting at the library?', time: '2m ago', unreadCount: 1 },
  { id: '2', name: 'Sarah J.', lastMessage: 'Sounds good, see you then! Sounds good, see you then! Sounds good, see you then!', time: '1h ago', unreadCount: 0 },
  { id: '3', name: 'Mike T.', lastMessage: 'No worries.', time: 'Yesterday', unreadCount: 0 },
];

export default function ChatsScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [chats, setChats] = useState(INITIAL_CHATS);

  const handleDelete = (id: string) => {
    setChats(chats.filter((chat) => chat.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, spacing.xl) }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Chats</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: TAB_BAR_HEIGHT + spacing['2xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {chats.map((chat) => (
          <ChatRow key={chat.id} {...chat} onDelete={handleDelete} />
        ))}

        {chats.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No conversations yet.</Text>
          </View>
        )}
      </ScrollView>
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
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 16,
  },
});
