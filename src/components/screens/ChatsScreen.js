import React, { useState, useEffect } from 'react';
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
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';
import { getChats, getOnlineUsers } from '../../utils/dummyData'; // Lấy dữ liệu từ dummyData

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=defaultUser';

const ChatsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    const loadedChats = getChats();
    const loadedOnlineUsers = getOnlineUsers();
    setChats(loadedChats);
    setFilteredChats(loadedChats);
    setOnlineUsers(loadedOnlineUsers);
  }, []);

  useEffect(() => {
    if (searchText === '') {
      setFilteredChats(chats);
    } else {
      const lowercasedFilter = searchText.toLowerCase();
      const filteredData = chats.filter(chat =>
        chat.name.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredChats(filteredData);
    }
  }, [searchText, chats]);

  const OnlineUserItem = ({ item }) => (
    <TouchableOpacity style={styles.onlineUserItem}>
      <Image source={{ uri: item.avatar || DEFAULT_AVATAR }} style={styles.onlineUserAvatar} />
      <Text style={styles.onlineUserName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
    </TouchableOpacity>
  );

  const ChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItemContainer}
      onPress={() => navigation.navigate('GroupChat', { chatId: item.id, chatName: item.name, chatAvatar: item.avatar })}
    >
      <Image source={{ uri: item.avatar || DEFAULT_AVATAR }} style={styles.chatAvatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
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
      </View>
      <TouchableOpacity style={styles.cameraIconContainer}>
        <Icon name="camera-outline" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {onlineUsers.length > 0 && (
        <FlatList
          horizontal
          data={onlineUsers}
          renderItem={OnlineUserItem}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.onlineUsersList}
          style={{ marginBottom: spacing.md }}
        />
      )}
      <Text style={styles.messagesTitle}>Messages</Text>
    </>
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
           {/* Icon cho nút back, bạn có thể thay bằng Ionicons nếu muốn */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity onPress={() => {/* Xử lý soạn tin mới */}} style={styles.headerButton}>
          <Icon name="create-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={ChatItem}
        keyExtractor={item => item.id}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'android' ? spacing.sm : spacing.xs,
    height: 56,
    backgroundColor: colors.white,
    // borderBottomWidth: 1, // Tùy chọn: thêm viền nếu cần
    // borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl + 2,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerButton: {
    padding: spacing.xs,
    minWidth: 40, // Đảm bảo vùng chạm
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  onlineUsersList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  onlineUserItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    width: 60,
  },
  onlineUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: spacing.xs / 2,
    borderWidth: 2,
    borderColor: colors.primary, // Viền cho online users
  },
  onlineUserName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messagesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listContentContainer: {
    paddingBottom: spacing.lg,
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.border,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs / 2,
  },
  chatName: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  chatTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  chatMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatLastMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 1, // Cho phép thu nhỏ nếu không đủ không gian
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto', // Đẩy badge sang phải
  },
  unreadText: {
    color: colors.white,
    fontSize: typography.fontSize.xs - 1,
    fontWeight: 'bold',
  },
  cameraIconContainer: {
    paddingLeft: spacing.sm,
  }
});

export default ChatsScreen;