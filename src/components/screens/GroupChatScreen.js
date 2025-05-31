import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';
import { getChatById, getCurrentUser } from '../../utils/dummyData'; // Đã sửa: bỏ dummyUsers vì không dùng trực tiếp ở đây

const DEFAULT_AVATAR_OTHER = 'https://i.pravatar.cc/150?u=otherUser';
const DEFAULT_AVATAR_CURRENT = 'https://i.pravatar.cc/150?u=currentUser';

const GroupChatScreen = ({ route, navigation }) => {
  const { chatId, chatName: initialChatName, chatAvatar: initialChatAvatar } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [chatName, setChatName] = useState(initialChatName);
  const [chatAvatar, setChatAvatar] = useState(initialChatAvatar);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchChatData = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);

      const chatDetails = getChatById(chatId);
      if (chatDetails) {
        setMessages(chatDetails.messages || []);
        if (!initialChatName && chatDetails.users && chatDetails.users.length > 0 && user) {
            const otherUser = chatDetails.users.find(u => u.id !== user.id);
            setChatName(otherUser ? otherUser.name : chatDetails.name || 'Chat');
            setChatAvatar(otherUser ? otherUser.avatar : chatDetails.avatar);
        } else if (!initialChatName && chatDetails.name) { 
            setChatName(chatDetails.name);
            setChatAvatar(chatDetails.avatar);
        }
      }
    };
    fetchChatData();
  }, [chatId, initialChatName, initialChatAvatar]);

  useEffect(() => {
    if (route.params?.imageUri && route.params?.targetChatId === chatId && currentUser) {
      const newImageMessage = {
        id: `msg${Date.now()}`,
        image: route.params.imageUri,
        sender: currentUser,
        timestamp: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, newImageMessage]);
      navigation.setParams({ imageUri: null, targetChatId: null });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [route.params?.imageUri, route.params?.targetChatId, currentUser, chatId, navigation]);

  const handleSendMessage = () => {
    if (inputText.trim() === '' || !currentUser) return;
    const newMessage = {
      id: `msg${Date.now()}`,
      text: inputText,
      sender: currentUser,
      timestamp: new Date().toISOString(),
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const MessageItem = ({ item }) => {
    const isCurrentUser = item.sender.id === currentUser?.id;
    const senderAvatar = item.sender.avatar || (isCurrentUser ? (currentUser?.avatar || DEFAULT_AVATAR_CURRENT) : DEFAULT_AVATAR_OTHER);

    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.currentUserMessageRow : styles.otherUserMessageRow]}>
        {!isCurrentUser && (
          <Image source={{ uri: senderAvatar }} style={styles.messageAvatar} />
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          {!isCurrentUser && item.sender && <Text style={styles.senderName}>{item.sender.name}</Text>}
          {item.text && (
            <Text style={[styles.messageText, isCurrentUser && styles.currentUserMessageText]}>
              {item.text}
            </Text>
          )}
          {item.image && <Image source={{ uri: item.image }} style={styles.messageImage} resizeMode="cover"/>}
          {/* <Text style={styles.timestampText}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text> */}
        </View>
        {isCurrentUser && (
          <Image source={{ uri: senderAvatar }} style={styles.messageAvatar} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back-outline" size={26} color={colors.text} />
        </TouchableOpacity>
        {chatAvatar && <Image source={{uri: chatAvatar}} style={styles.headerAvatar} />}
        <Text style={styles.headerTitle} numberOfLines={1}>{chatName || 'Chat'}</Text>
        <TouchableOpacity onPress={() => {/* Xử lý cuộc gọi video/audio */}} style={styles.headerButton}>
          <Icon name="call-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} 
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={MessageItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.messagesListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Camera', { source: 'Chat', chatId: chatId })}
            style={styles.inputActionButton}
          >
            <Icon name="camera-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Camera', { source: 'Chat', chatId: chatId, pickOnly: true })}
            style={styles.inputActionButton}
          >
            <Icon name="image-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity onPress={handleSendMessage} style={[styles.inputActionButton, styles.sendButton]} disabled={inputText.trim() === ''}>
            <Icon name="paper-plane-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    height: 56,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'left',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  currentUserMessageRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherUserMessageRow: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: spacing.xs,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    minWidth: 50,
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: colors.background,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    fontWeight: '500',
  },
  messageText: { 
    fontSize: typography.fontSize.md,
    color: colors.text, 
    lineHeight: typography.fontSize.md * 1.4,
  },
  currentUserMessageText: { 
    color: colors.white, 
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginTop: spacing.xs,
    backgroundColor: colors.border, // Placeholder
  },
  timestampText: {
    fontSize: typography.fontSize.xs - 2,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: spacing.xs / 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs -2, 
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginHorizontal: spacing.xs, // Thêm khoảng cách giữa các nút và input
  },
  inputActionButton: {
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.sm - (Platform.OS === 'ios' ? 2 : 4), 
    // marginLeft: spacing.xs, // Không cần nếu textInput đã có marginHorizontal
  },
});

export default GroupChatScreen;