import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { colors, spacing, typography } from "../../theme";
import { profileService } from "../../api/profile";
import { socketService } from "../../api/socket";

const DEFAULT_AVATAR = "https://i.pravatar.cc/150?u=defaultUser";

const ChatsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const currentUser = useSelector((state) => state.auth.user.user);

  useEffect(() => {
    let socketCleanup = null;

    const fetchUsers = async () => {
      try {
        // Kết nối Socket.IO
        const socket = await socketService.connect();
        if (!socket) {
          console.error("Failed to connect to socket");
          return;
        }

        // Lắng nghe tin nhắn mới để cập nhật danh sách
        socketService.on("private_message", (msg) => {
          setUsers((prevUsers) => {
            const userIndex = prevUsers.findIndex(
              (user) => user._id === msg.from || user._id === msg.to
            );
            if (userIndex !== -1) {
              const updatedUsers = [...prevUsers];
              updatedUsers[userIndex] = {
                ...updatedUsers[userIndex],
                lastMessage: msg.content || (msg.imageUrl ? "[Image]" : ""),
                lastMessageTime: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                unreadCount: (updatedUsers[userIndex].unreadCount || 0) + 1,
              };
              return updatedUsers;
            }
            return prevUsers;
          });
        });

        socketCleanup = () => socketService.off("private_message");

        // Lấy tất cả người dùng từ API
        const response = await profileService.getAllUser();
        if (!response?.data) {
          console.error("No data returned from getAllUser");
          return;
        }

        // Lọc người dùng hiện tại và ánh xạ dữ liệu
        const userData = response.data
          .filter((user) => {
            if (!currentUser?.id) {
              console.warn(
                "Current user ID is not available, including all users"
              );
              return true; // Nếu không có currentUser.id, giữ tất cả để tránh lỗi
            }
            const isExcluded = user._id !== currentUser.id;
            if (!isExcluded) {
              console.log(`Excluding current user with ID: ${user._id}`);
            }
            return isExcluded;
          })
          .map((user) => ({
            id: user._id,
            partnerId: user._id,
            partnerName: user.username || "Unknown User",
            partnerAvatar: user.avatar || DEFAULT_AVATAR,
            lastMessage: "",
            lastMessageTime: "",
            unreadCount: 0,
          }));

        console.log("Fetched users (excluding current):", userData);
        setUsers(userData);
        setFilteredUsers(userData);
      } catch (error) {
        console.error("Failed to fetch users:", error.message);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchText === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedFilter = searchText.toLowerCase();
      const filteredData = users.filter((user) =>
        user.partnerName.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredUsers(filteredData);
    }
  }, [searchText, users]);

  const UserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItemContainer}
      onPress={() =>
        navigation.navigate("GroupChat", {
          chatId: item.partnerId,
          chatName: item.partnerName,
          chatAvatar: item.partnerAvatar,
        })
      }
    >
      <Image
        source={{ uri: item.partnerAvatar || DEFAULT_AVATAR }}
        style={styles.chatAvatar}
      />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.partnerName}</Text>
          {item.lastMessageTime && (
            <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
          )}
        </View>
        {item.lastMessage && (
          <View style={styles.chatMessageRow}>
            <Text style={styles.chatLastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Camera", {
            source: "Chat",
            chatId: item.partnerId,
          })
        }
        style={styles.cameraIconContainer}
      >
        <Icon name="camera-outline" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <View style={styles.searchContainer}>
        <Icon
          name="search-outline"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <Text style={styles.messagesTitle}>Users</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="arrow-back-outline" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity onPress={() => {}} style={styles.headerButton}>
          <Icon name="create-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={UserItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "android" ? spacing.sm : spacing.xs,
    height: 56,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl + 2,
    fontWeight: "bold",
    color: colors.text,
  },
  headerButton: {
    padding: spacing.xs,
    minWidth: 40,
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  messagesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listContentContainer: {
    paddingBottom: spacing.lg,
  },
  chatItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs / 2,
  },
  chatName: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: colors.text,
  },
  chatTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  chatMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatLastMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  unreadText: {
    color: colors.white,
    fontSize: typography.fontSize.xs - 1,
    fontWeight: "bold",
  },
  cameraIconContainer: {
    paddingLeft: spacing.sm,
  },
});

export default ChatsScreen;
