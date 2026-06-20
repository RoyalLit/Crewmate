import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

import { useTheme } from '../../../src/design/theme';
import { spacing, brandColors } from '../../../src/design/tokens';
import { useSocket } from '../../../src/context/SocketContext';
import { useChatHistory, MessageResponseDTO } from '../../../src/api/chatsHooks';
import { useAuth } from '../../../src/context/AuthContext';
import { useRideDetailsQuery } from '../../../src/api/ridesHooks';
import { useWithdrawRequestMutation, useRemovePassengerMutation, useIncomingRequestsQuery, useMyRequestsQuery } from '../../../src/api/requestsHooks';
import { useBlockUserMutation, useCheckBlockQuery } from '../../../src/api/safetyHooks';
import { getDerivedRideStatus } from '../../../src/utils/rideUtils';
import { CustomActionSheet } from '../../../src/components/CustomActionSheet';
import { CHAT_BG_LIGHT, CHAT_BG_DARK } from '../../../src/utils/imageAssets';

export default function ChatScreen(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { rideId, otherUserId, name, rideInfo } = useLocalSearchParams<{ rideId: string; otherUserId: string; name?: string; rideInfo?: string }>();
  
  const { session } = useAuth();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  const flatListRef = useRef<any>(null);
  const [messageText, setMessageText] = useState('');
  const { data: rideData } = useRideDetailsQuery(rideId as string);
  const { data: incomingRequests } = useIncomingRequestsQuery();
  const { data: myRequests } = useMyRequestsQuery();
  const { data: blockData } = useCheckBlockQuery(otherUserId as string);

  const isBlocked = blockData?.data?.isBlocked;

  const removePassengerMutation = useRemovePassengerMutation();
  const withdrawRequestMutation = useWithdrawRequestMutation();
  const blockUserMutation = useBlockUserMutation();

  const isPoster = session?.user?.id === rideData?.data?.posterId;

  // Find request ID
  // Handle both paginated (data.data) and non-paginated (data) responses
  const incomingReqsArray = Array.isArray(incomingRequests?.data) ? incomingRequests.data : (incomingRequests?.data?.data || []);
  const incomingReq = incomingReqsArray.find((req: any) => 
    (req.rideId === rideId || req.ride?._id === rideId) && req.requester?._id === otherUserId
  );
  
  const myReqsArray = Array.isArray(myRequests?.data) ? myRequests.data : (myRequests?.data?.data || []);
  const myReq = myReqsArray.find((req: any) => 
    req.rideId === rideId || req.ride?._id === rideId
  );
  const requestId = incomingReq?._id || incomingReq?.id || myReq?._id || myReq?.id;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const derivedStatus = getDerivedRideStatus(rideData?.data);
  const isRidePast = derivedStatus !== 'active';

  const handleAction = (label: string) => {
    if (label === 'Remove Passenger' || label === 'Withdraw Request') {
      if (requestId) {
        if (isPoster) {
          removePassengerMutation.mutate(requestId);
        } else {
          withdrawRequestMutation.mutate(requestId);
        }
        router.back();
      }
    } else if (label === 'Block User') {
      blockUserMutation.mutate({ userIdToBlock: otherUserId as string });
      router.back();
    } else if (label === 'Report') {
      router.push(`/report/${otherUserId}`);
    }
  };

  const actionLabels = isRidePast 
    ? ['Block User', 'Report']
    : isPoster 
      ? ['Remove Passenger', 'Block User', 'Report']
      : ['Withdraw Request', 'Block User', 'Report'];

  const actionOptions = actionLabels.map(label => ({
    label,
    isDestructive: label === 'Remove Passenger' || label === 'Withdraw Request',
    onPress: () => handleAction(label),
  }));

  const openActionSheet = () => {
    setIsSheetOpen(true);
  };

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
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{name || 'Chat'}</Text>
          {/* Banner text for context */}
          {rideInfo ? (
            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>{rideInfo}</Text>
          ) : null}
        </View>
        <Pressable 
          onPress={openActionSheet} 
          style={styles.menuButton}
          disabled={isSheetOpen}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.electricViolet} />
        </View>
      ) : (
        <ImageBackground
          source={isDark ? CHAT_BG_DARK : CHAT_BG_LIGHT}
          style={styles.chatBackground}
          imageStyle={styles.chatBackgroundImage}
          accessibilityElementsHidden
        >
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
        </ImageBackground>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
      >
        <View style={[styles.inputContainer, { 
          backgroundColor: isDark ? colors.background.card : '#FFF',
          borderTopColor: colors.border.default,
          paddingBottom: Math.max(insets.bottom, spacing.md)
        }]}>
          <TextInput
            style={[styles.input, { 
              color: colors.text.primary,
              backgroundColor: isDark ? colors.background.primary : '#F0F2F5',
              borderColor: colors.border.default
            }]}
            placeholder={isBlocked ? "Cannot send messages" : "Type a message..."}
            placeholderTextColor={colors.text.placeholder}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            editable={!isBlocked}
          />
          <Pressable 
            style={[styles.sendButton, { 
              backgroundColor: messageText.trim() && !isBlocked ? brandColors.electricViolet : colors.background.subtle 
            }]}
            onPress={handleSend}
            disabled={!messageText.trim() || isBlocked}
          >
            <Ionicons name="send" size={18} color={messageText.trim() && !isBlocked ? '#FFF' : colors.text.placeholder} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <CustomActionSheet
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        options={actionOptions}
      />
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
    flex: 1,
    alignItems: 'center',
  },
  menuButton: {
    padding: spacing.xs,
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
  chatBackground: {
    flex: 1,
  },
  chatBackgroundImage: {
    opacity: 1, // Adjusted for subtlety, tweak if necessary
    resizeMode: 'cover',
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
