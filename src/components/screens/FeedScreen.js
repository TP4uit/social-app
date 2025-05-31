import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts } from '../../redux/actions/postsActions';
import { colors, spacing, typography } from '../../theme';
import PostItem from './components/PostItem'; // Đã cập nhật PostItem
import Icon from 'react-native-vector-icons/Ionicons'; // Sử dụng Ionicons

// Giữ lại dummy stories data hoặc cập nhật nếu cần
const STORIES = [
  { id: 'your-story', username: 'Your Story', avatar: null, hasStory: true, isYourStory: true }, // isYourStory sẽ giúp style dấu '+'
  { id: 'user1', username: 'karennne', avatar: 'https://randomuser.me/api/portraits/women/79.jpg', hasStory: true },
  { id: 'user2', username: 'zackjohn', avatar: 'https://randomuser.me/api/portraits/men/86.jpg', hasStory: true },
  { id: 'user3', username: 'kiero_d', avatar: 'https://randomuser.me/api/portraits/men/29.jpg', hasStory: true },
  { id: 'user4', username: 'craig_love', avatar: 'https://randomuser.me/api/portraits/men/40.jpg', hasStory: true },
  { id: 'user5', username: 'lielis', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', hasStory: true },
  { id: 'user6', username: 'other', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', hasStory: true },
];

const StoryItem = ({ item }) => {
  return (
    <TouchableOpacity style={styles.storyContainer}>
      <View style={[
        styles.storyAvatarWrapper,
        item.hasStory && !item.isYourStory ? styles.hasStoryBorder : styles.noStoryBorder,
      ]}>
        {item.isYourStory ? (
          <View style={[styles.storyAvatar, styles.yourStoryAvatar]}>
            <Text style={styles.yourStoryPlus}>+</Text>
          </View>
        ) : (
          <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {item.username}
      </Text>
    </TouchableOpacity>
  );
};

const FeedScreen = ({ navigation }) => { // Thêm navigation prop
  const dispatch = useDispatch();
  const { posts = [], loading, error, hasMore, page = 1 } = useSelector(state => state.posts || {});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts(1); // Tải trang đầu tiên khi component mount
  }, []);

  const loadPosts = (pageNum) => {
    if (pageNum === 1 && posts.length === 0 && loading) return; // Tránh gọi lại nếu đang tải trang đầu
    try {
      dispatch(fetchPosts(pageNum));
    } catch (err) {
      console.log(`Error loading posts (page ${pageNum}):`, err);
    }
  };

  const loadMorePosts = () => {
    if (hasMore && !loading && !refreshing) { // Chỉ tải thêm khi có thêm dữ liệu và không đang loading/refreshing
      loadPosts(page + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(1); // Tải lại từ trang 1
    // setRefreshing(false) sẽ được xử lý trong useEffect hoặc dựa vào loading state
  };
  
  // Tự động setRefreshing(false) khi loading kết thúc và page là 1 (sau khi refresh)
  useEffect(() => {
    if (!loading && refreshing && page === 1) {
      setRefreshing(false);
    }
  }, [loading, refreshing, page]);


  const ListHeaderComponent = () => (
    <View style={styles.storiesOuterContainer}>
      <FlatList
        horizontal
        data={STORIES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <StoryItem item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      />
    </View>
  );

  const renderItem = ({ item }) => {
    if (!item || !item.author) {
      // console.warn("PostItem skipped due to missing item or author:", item);
      return null;
    }
    const safeItem = {
      ...item,
      author: {
        name: item.author.name || 'Unknown User',
        avatar: item.author.avatar || null, // PostItem mới không dùng avatar này trực tiếp
        ...item.author,
      },
      comments: item.comments || [],
      likes: item.likes || 0,
    };
    return <PostItem post={safeItem} />;
  };

  const renderFooter = () => {
    if (!loading || refreshing || page === 1 && posts.length === 0) return null; // Không hiển thị khi đang refresh hoặc tải lần đầu
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading && page === 1 && !refreshing) { // Chỉ hiển thị loading cho lần tải đầu
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (error && !loading && posts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>
            Something went wrong. Please try again.
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!loading && posts.length === 0 && !error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubText}>
            Follow friends or explore to see posts here.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white} // Hoặc màu header nếu header có màu khác
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconContainer} onPress={() => navigation.navigate('Post')}>
          <Icon name="add-circle-outline" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Drama Social</Text>
        <TouchableOpacity style={styles.headerIconContainer} onPress={() => {/* Navigate to Chat/Messenger */}}>
          <Icon name="chatbubble-ellipses-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => (item?.id ?? Math.random().toString())}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={[colors.primary]} // Màu của indicator
            tintColor={colors.primary} // Màu của indicator cho iOS
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Màu nền chung cho feed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white, // Nền header
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56, // Chiều cao header chuẩn
  },
  headerIconContainer: {
    padding: spacing.xs,
  },
  headerLogo: {
    fontSize: typography.fontSize.xl, // Cỡ chữ cho logo
    fontWeight: 'bold', // Font đậm
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', // Font chữ phù hợp hơn
  },
  storiesOuterContainer: {
    backgroundColor: colors.white, // Nền trắng cho khu vực stories
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm, // Thêm padding dưới cho stories bar
  },
  storiesContent: {
    paddingHorizontal: spacing.sm, // Padding ngang cho story items
    paddingVertical: spacing.sm,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: spacing.sm - 2, // Khoảng cách giữa các story
    width: 70, // Chiều rộng của mỗi story item
  },
  storyAvatarWrapper: {
    width: 64, // Kích thước viền
    height: 64,
    borderRadius: 32, // Bo tròn viền
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  hasStoryBorder: {
    borderWidth: 2,
    borderColor: colors.primary, // Màu viền cho story chưa xem (ví dụ)
  },
  noStoryBorder: {
    borderWidth: 1, // Viền mỏng cho story đã xem hoặc không có story
    borderColor: colors.border,
  },
  storyAvatar: {
    width: 58, // Kích thước avatar bên trong
    height: 58,
    borderRadius: 29, // Bo tròn avatar
    backgroundColor: colors.border, // Màu nền placeholder cho avatar
  },
  yourStoryAvatar: { // Style riêng cho "Your Story"
    backgroundColor: colors.background, // Nền khác biệt
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  yourStoryPlus: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '300',
  },
  storyUsername: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: 50, // Để không bị che bởi header/stories
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default FeedScreen;