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
        } else if (!initialChatName && chatDetails.name) { // Fallback nếu không có users array hoặc user
            setChatName(chatDetails.name);
            setChatAvatar(chatDetails.avatar);
        }
      }
    };
    fetchChatData();
  }, [chatId, initialChatName, initialChatAvatar]);


  const handleSendMessage = () => {
    if (inputText.trim() === '' || !currentUser) return;
    const newMessage = {
      id: `msg${Date.now()}`,
      text: inputText,
      sender: currentUser, // Sử dụng toàn bộ đối tượng user hiện tại
      timestamp: new Date().toISOString(),
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const MessageItem = ({ item }) => {
    const isCurrentUser = item.sender.id === currentUser?.id;
    // Sử dụng avatar từ sender, nếu không có thì dùng default
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Điều chỉnh offset cho header
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={MessageItem}
          keyExtractor={item => item.id.toString()} // Đảm bảo key là string
          contentContainerStyle={styles.messagesListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity onPress={() => {/* Mở image picker */}} style={styles.inputActionButton}>
            <Icon name="image-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {/* Mở camera */}} style={styles.inputActionButton}>
            <Icon name="camera-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
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
  messageText: { // Style chung cho text tin nhắn
    fontSize: typography.fontSize.md,
    color: colors.text, // Màu mặc định (cho tin nhắn của người khác)
    lineHeight: typography.fontSize.md * 1.4,
  },
  currentUserMessageText: { // Style riêng cho text tin nhắn của người dùng hiện tại
    color: colors.white, // Chữ màu trắng
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginTop: spacing.xs,
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
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs -2, // Điều chỉnh padding cho Android
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginRight: spacing.sm,
  },
  inputActionButton: {
    paddingHorizontal: spacing.sm, // Tăng padding ngang cho dễ nhấn
    paddingVertical: spacing.xs,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.sm - (Platform.OS === 'ios' ? 2 : 4), // Điều chỉnh padding icon cho cân đối
    marginLeft: spacing.xs, // Thêm khoảng cách nhỏ
  },
});

export default GroupChatScreen;