import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

import { useTheme } from '../../../src/design/theme';
import { spacing, brandColors } from '../../../src/design/tokens';
import { useSocket } from '../../../src/context/SocketContext';
import { useChatHistory, MessageResponseDTO } from '../../../src/api/chatsHooks';
import { useAuth } from '../../../src/context/AuthContext';

export default function ChatScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { rideId, otherUserId } = useLocalSearchParams<{ rideId: string; otherUserId: string }>();
  
  const { session } = useAuth();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useChatHistory(rideId, otherUserId);

  const messages = data?.pages.flat() || [];

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('join_ride', rideId);

    const handleReceiveMessage = (message: MessageResponseDTO) => {
      // Add message to cache optimistically
      queryClient.setQueryData(['chat', rideId, otherUserId], (oldData: any) => {
        if (!oldData) return oldData;
        const newPages = [...oldData.pages];
        newPages[0] = [message, ...newPages[0]]; // Since it's inverted, index 0 is top visually
        return {
          ...oldData,
          pages: newPages,
        };
      });

      // Mark as read if we are the receiver
      if (message.receiverId === session?.user.id) {
        socket.emit('mark_read', message.id);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, isConnected, rideId, otherUserId, session?.user.id, queryClient]);

  const handleSend = () => {
    if (!messageText.trim() || !socket || !isConnected) return;
    
    socket.emit('send_message', {
      rideId,
      receiverId: otherUserId,
      content: messageText.trim()
    });

    setMessageText('');
  };

  const renderMessage = ({ item }: { item: MessageResponseDTO }) => {
    const isMe = item.senderId === session?.user.id;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperOther]}>
        <View style={[
          styles.messageBubble, 
          isMe ? [styles.messageBubbleMe, { backgroundColor: brandColors.electricViolet }] : [styles.messageBubbleOther, { backgroundColor: isDark ? colors.background.subtle : '#EAEBEE' }]
        ]}>
          <Text style={[styles.messageText, { color: isMe ? '#FFF' : colors.text.primary }]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.text.placeholder }]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border.default }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Chat</Text>
          {/* Banner text for context */}
          <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Ride Context Active</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.electricViolet} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={brandColors.electricViolet} style={{ margin: spacing.md }} /> : null}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.background.primary, borderTopColor: colors.border.default, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? colors.background.subtle : '#F2F3F5', color: colors.text.primary }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.text.placeholder}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
          />
          <Pressable 
            style={[styles.sendButton, !messageText.trim() && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!messageText.trim() || !isConnected}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 18,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  messageWrapperMe: {
    justifyContent: 'flex-end',
  },
  messageWrapperOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleMe: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'PlusJakartaSans-500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
  timeText: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brandColors.electricViolet,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});
