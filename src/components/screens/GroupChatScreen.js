import React, { useState, useEffect, useRef } from "react";
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
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { colors, spacing, typography } from "../../theme";
import chatApi from "../../api/chat";
import * as ImagePicker from "expo-image-picker";
import { socketService } from "../../api/socket";
import { profileService } from "../../api/profile";
import { addMessage } from "../../redux/actions/chatActions";

const DEFAULT_AVATAR_OTHER = "https://i.pravatar.cc/150?u=otherUser";
const DEFAULT_AVATAR_CURRENT = "https://i.pravatar.cc/150?u=currentUser";

const GroupChatScreen = ({ route, navigation }) => {
  const {
    chatId,
    chatName: initialChatName,
    chatAvatar: initialChatAvatar,
  } = route.params;
  const dispatch = useDispatch();
  const messages = useSelector(
    (state) => state.chat.messagesByChat[chatId] || []
  );
  const currentUser = useSelector((state) => state.auth.user);
  const [inputText, setInputText] = useState("");
  const [chatName, setChatName] = useState(initialChatName);
  const [chatAvatar, setChatAvatar] = useState(initialChatAvatar);
  const [userProfiles, setUserProfiles] = useState({}); // Cache for other users' profiles
  const flatListRef = useRef(null);

  // Initialize Socket.IO, sync user, and fetch chat data
  useEffect(() => {
    let socketCleanup = null;

    const initializeChat = async () => {
      // Sync current user data
      const syncedUser = await syncCurrentUser();
      if (!syncedUser) {
        Alert.alert("Error", "Failed to load user data");
        return;
      }

      const socket = await socketService.connect();
      if (!socket) {
        Alert.alert("Error", "Failed to connect to server");
        return;
      }

      socketService.on("private_message", (msg) => {
        if (
          (msg.from === chatId && msg.to === syncedUser?.id) ||
          (msg.to === chatId && msg.from === syncedUser?.id)
        ) {
          dispatch(
            addMessage(chatId, {
              _id: `msg${Date.now()}`,
              from: msg.from,
              to: msg.to,
              content: msg.content,
              type: msg.imageUrl ? "image" : "text",
              imageUrl: msg.imageUrl,
              createdAt: new Date().toISOString(),
            })
          );
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: true }),
            100
          );
        }
      });

      socketCleanup = () => socketService.off("private_message");

      try {
        await dispatch(fetchChatHistory(chatId));
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: false }),
          100
        );
      } catch (error) {
        Alert.alert("Error", "Failed to load chat history");
      }

      // Fetch partner profile if not provided
      if (!initialChatName) {
        try {
          const { user: partner } = await profileService.fetchUserProfileById(
            chatId
          );
          setChatName(partner?.username || "Chat");
          setChatAvatar(partner?.avatar || DEFAULT_AVATAR_OTHER);
          setUserProfiles((prev) => ({ ...prev, [chatId]: partner }));
        } catch (error) {
          console.error("Failed to fetch partner profile:", error);
        }
      }
    };

    initializeChat();

    return () => {
      if (socketCleanup) socketCleanup();
    };
  }, [chatId, dispatch, initialChatName]);

  // Fetch user profiles for messages
  useEffect(() => {
    const fetchProfiles = async () => {
      const uniqueUserIds = [
        ...new Set(
          messages
            .map((msg) => msg.from)
            .filter((id) => id !== currentUser?.id && !userProfiles[id])
        ),
      ];
      for (const userId of uniqueUserIds) {
        try {
          const { user } = await profileService.fetchUserProfileById(userId);
          setUserProfiles((prev) => ({ ...prev, [userId]: user }));
        } catch (error) {
          console.error(`Failed to fetch profile for user ${userId}:`, error);
        }
      }
    };

    if (messages.length > 0 && currentUser) {
      fetchProfiles();
    }
  }, [messages, currentUser, userProfiles]);

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || !currentUser) return;

    const message = {
      to: chatId,
      content: inputText,
      imageUrl: null,
    };

    socketService.emit("private_message", message);
    dispatch(
      addMessage(chatId, {
        _id: `msg${Date.now()}`,
        from: currentUser.id,
        to: chatId,
        content: inputText,
        type: "text",
        createdAt: new Date().toISOString(),
      })
    );

    setInputText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        const imageUrl = await imageService.getImageString(
          result.assets[0].uri
        );
        if (imageUrl) {
          const message = {
            to: chatId,
            content: "",
            imageUrl,
          };

          socketService.emit("private_message", message);
          dispatch(
            addMessage(chatId, {
              _id: `msg${Date.now()}`,
              from: currentUser.id,
              to: chatId,
              content: "",
              type: "image",
              imageUrl,
              createdAt: new Date().toISOString(),
            })
          );

          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: true }),
            100
          );
        }
      } catch (error) {
        Alert.alert("Error", "Failed to upload image");
      }
    }
  };

  const MessageItem = ({ item }) => {
    const isCurrentUser = item.from === currentUser?.id;
    const profile = isCurrentUser
      ? currentUser
      : userProfiles[item.from] || {
          username: "Loading...",
          avatar: DEFAULT_AVATAR_OTHER,
        };

    return (
      <View
        style={[
          styles.messageRow,
          isCurrentUser
            ? styles.currentUserMessageRow
            : styles.otherUserMessageRow,
        ]}
      >
        {!isCurrentUser && (
          <Image
            source={{ uri: profile.avatar }}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}
        >
          {!isCurrentUser && (
            <Text style={styles.senderName}>{profile.username}</Text>
          )}
          {item.content && (
            <Text
              style={[
                styles.messageText,
                isCurrentUser && styles.currentUserMessageText,
              ]}
            >
              {item.content}
            </Text>
          )}
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.timestampText}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        {isCurrentUser && (
          <Image
            source={{ uri: profile.avatar }}
            style={styles.messageAvatar}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="arrow-back-outline" size={26} color={colors.text} />
        </TouchableOpacity>
        {chatAvatar && (
          <Image source={{ uri: chatAvatar }} style={styles.headerAvatar} />
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {chatName || "Chat"}
        </Text>
        <TouchableOpacity onPress={() => {}} style={styles.headerButton}>
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
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.messagesListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.inputActionButton}
          >
            <Icon name="image-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.inputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[styles.inputActionButton, styles.sendButton]}
            disabled={inputText.trim() === ""}
          >
            <Icon name="send" size={24} color={colors.white} />
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
    flexDirection: "row",
    alignItems: "center",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "left",
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: spacing.xs,
    maxWidth: "80%",
  },
  currentUserMessageRow: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  otherUserMessageRow: {
    alignSelf: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: spacing.xs,
    alignSelf: "flex-end",
  },
  messageBubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    minWidth: 50,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontWeight: "500",
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
  },
  timestampText: {
    fontSize: typography.fontSize.xs - 2,
    color: colors.textSecondary,
    alignSelf: "flex-end",
    marginTop: spacing.xs / 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputText: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.sm : spacing.xs - 2,
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginHorizontal: spacing.xs,
  },
  inputActionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.sm - (Platform.OS === "ios" ? 2 : 4),
  },
});

export default GroupChatScreen;
