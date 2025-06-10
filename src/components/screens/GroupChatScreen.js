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
import * as ImagePicker from "expo-image-picker";
import { socketService } from "../../api/socket";
import { profileService } from "../../api/profile";
import {
  addMessage,
  setMessages,
  fetchChatHistory,
} from "../../redux/actions/chatActions";

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
  const currentUser = useSelector((state) => state.auth.user.user);
  const [inputText, setInputText] = useState("");
  const [chatName, setChatName] = useState(initialChatName);
  const [chatAvatar, setChatAvatar] = useState(initialChatAvatar);
  const [userProfiles, setUserProfiles] = useState({});
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);

  // Initialize Socket.IO and fetch chat data
  useEffect(() => {
    let socketCleanup = null;

    const initializeChat = async () => {
      if (!currentUser?.id) {
        try {
          const { user } = await profileService.getCurrentUserProfile();
          dispatch({ type: "SET_USER", payload: user });
        } catch (err) {
          console.error(
            "Failed to load user profile:",
            err.message,
            err.response?.data
          );
          Alert.alert("Error", "Please log in to continue");
          navigation.navigate("Login");
          return;
        }
      }

      const socket = await socketService.connect();
      if (!socket) {
        setError(
          "Failed to connect to server. Messages may not update in real-time."
        );
        return;
      }

      socketService.emit("join_chat", chatId);
      socketService.on("private_message", (msg) => {
        if (
          (msg.from === chatId && msg.to === currentUser?.id) ||
          (msg.to === chatId && msg.from === currentUser?.id)
        ) {
          dispatch(
            addMessage(chatId, {
              _id:
                msg._id ||
                `msg${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
              from: msg.from,
              to: msg.to,
              content: msg.content || "",
              type: msg.imageUrl ? "image" : "text",
              imageUrl: msg.imageUrl || null,
              createdAt: msg.createdAt || new Date().toISOString(),
            })
          );
          setTimeout(
            () => flatListRef.current?.scrollToEnd({ animated: true }),
            100
          );
        }
      });

      socketService.on("message_error", ({ error }) => {
        console.error("Server failed to save message:", error);
        setError("Failed to send message. Please try again.");
      });

      socketCleanup = () => {
        socketService.emit("leave_chat", chatId);
        socketService.off("private_message");
        socketService.off("message_error");
      };

      try {
        console.log(
          "Fetching chat history for chatId:",
          chatId,
          "userId:",
          currentUser.id
        );
        await dispatch(fetchChatHistory(chatId, currentUser.id));
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: false }),
          100
        );
      } catch (error) {
        console.error("Failed to load chat history:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError("Failed to load chat history. Please try again.");
      }

      if (!initialChatName) {
        try {
          const { user: partner } = await profileService.fetchUserProfileById(
            chatId
          );
          setChatName(partner?.username || "Chat");
          setChatAvatar(partner?.avatar || DEFAULT_AVATAR_OTHER);
          setUserProfiles((prev) => ({ ...prev, [chatId]: partner }));
        } catch (error) {
          console.error(
            "Failed to fetch partner profile:",
            error.message,
            error.response?.data
          );
        }
      }
    };

    initializeChat();

    return () => {
      if (socketCleanup) socketCleanup();
    };
  }, [chatId, dispatch, initialChatName, currentUser?.id, navigation]);

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
          console.error(
            `Failed to fetch profile for user ${userId}:`,
            error.message,
            error.response?.data
          );
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
      from: currentUser.id,
      to: chatId,
      content: inputText,
      imageUrl: null,
    };

    try {
      socketService.emit("private_message", message);
      dispatch(
        addMessage(chatId, {
          _id: `msg${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
          from: currentUser.id,
          to: chatId,
          content: inputText,
          type: "text",
          createdAt: new Date().toISOString(),
        })
      );
      setInputText("");
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    } catch (error) {
      console.error(
        "Failed to send message:",
        error.message,
        error.response?.data
      );
      setError("Failed to send message. Please try again.");
    }
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
            from: currentUser.id,
            to: chatId,
            content: "",
            imageUrl,
          };

          socketService.emit("private_message", message);
          dispatch(
            addMessage(chatId, {
              _id: `msg${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
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
        console.error(
          "Failed to upload image:",
          error.message,
          error.response?.data
        );
        Alert.alert("Error", "Failed to upload image");
      }
    }
  };

  const MessageItem = ({ item }) => {
    console.log("message item", currentUser?._id);
    const isCurrentUser = item.from === currentUser?._id;
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
        <Image source={{ uri: profile.avatar }} style={styles.messageAvatar} />
        <View style={styles.messageContainer}>
          {!isCurrentUser && (
            <Text style={styles.senderName}>{profile.username}</Text>
          )}
          <View
            style={[
              styles.messageBubble,
              isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
            ]}
          >
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
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
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
  errorContainer: {
    backgroundColor: colors.error,
    padding: spacing.sm,
    alignItems: "center",
  },
  errorText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
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
    alignItems: "flex-start",
  },
  currentUserMessageRow: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse", // Reverse for avatar on left
  },
  otherUserMessageRow: {
    alignSelf: "flex-start",
  },
  messageContainer: {
    flex: 1,
    maxWidth: "75%", // Reduced to accommodate avatar
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: spacing.xs,
    marginTop: spacing.xs, // Align with top of bubble
  },
  messageBubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserBubble: {
    backgroundColor: "#4CAF50", // Green
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: colors.background, // Light gray
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    fontWeight: "500",
  },
  messageText: {
    fontSize: typography.fontSize.md,
    color: colors.text, // Black for others
    lineHeight: typography.fontSize.md * 1.4,
  },
  currentUserMessageText: {
    color: colors.white, // White for current user
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
