import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchPosts, loadMorePosts } from "../../redux/actions/postsActions";
import { colors, spacing, typography } from "../../theme";
import PostItem from "./components/PostItem";
import Icon from "react-native-vector-icons/Ionicons";

const STORIES = [
  {
    id: "your-story",
    username: "Your Story",
    avatar: null,
    hasStory: true,
    isYourStory: true,
  },
  {
    id: "user1",
    username: "karennne",
    avatar: "https://randomuser.me/api/portraits/women/79.jpg",
    hasStory: true,
  },
  {
    id: "user2",
    username: "zackjohn",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    hasStory: true,
  },
  {
    id: "user3",
    username: "kiero_d",
    avatar: "https://randomuser.me/api/portraits/men/29.jpg",
    hasStory: true,
  },
  {
    id: "user4",
    username: "craig_love",
    avatar: "https://randomuser.me/api/portraits/men/40.jpg",
    hasStory: true,
  },
  {
    id: "user5",
    username: "lielis",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    hasStory: true,
  },
  {
    id: "user6",
    username: "other",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    hasStory: true,
  },
];

const StoryItem = ({ item }) => {
  return (
    <TouchableOpacity style={styles.storyContainer}>
      <View
        style={[
          styles.storyAvatarWrapper,
          item.hasStory && !item.isYourStory
            ? styles.hasStoryBorder
            : styles.noStoryBorder,
        ]}
      >
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

const FeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    displayedPosts = [],
    loading,
    error,
    allPosts = [],
    displayedCount,
  } = useSelector((state) => state.posts || {});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log("FeedScreen mounted, displayedPosts:", displayedPosts); // Debug log
    if (displayedPosts.length === 0) {
      dispatch(fetchPosts());
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("displayedPosts updated:", displayedPosts); // Debug log
  }, [displayedPosts]);

  const handleLoadMore = () => {
    if (!loading && !refreshing && displayedCount < allPosts.length) {
      dispatch(loadMorePosts());
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(fetchPosts()).finally(() => setRefreshing(false));
  };

  // Filter valid posts
  const validPosts = displayedPosts.filter(
    (post) => post && post._id && post.author
  );

  const ListHeaderComponent = () => (
    <View style={styles.storiesOuterContainer}>
      <FlatList
        horizontal
        data={STORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoryItem item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      />
    </View>
  );

  const renderItem = ({ item }) => {
    if (!item || !item.author) {
      console.warn("Invalid post item:", item); // Debug log
      return null;
    }
    return <PostItem post={item} />;
  };

  const renderFooter = () => {
    if (!loading || refreshing || validPosts.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading && !refreshing && validPosts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (error && !loading && validPosts.length === 0) {
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
    if (!loading && validPosts.length === 0 && !error) {
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={() => navigation.navigate("Post")}
        >
          <Icon name="add-circle-outline" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>Drama Social</Text>
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={() => navigation.navigate("Chats")}
        >
          <Icon
            name="chatbubble-ellipses-outline"
            size={26}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={validPosts}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item?._id?.toString() || Math.random().toString()
        }
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56,
  },
  headerIconContainer: {
    padding: spacing.xs,
  },
  headerLogo: {
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  storiesOuterContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  storiesContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  storyContainer: {
    alignItems: "center",
    marginHorizontal: spacing.sm - 2,
    width: 70,
  },
  storyAvatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  hasStoryBorder: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  noStoryBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  storyAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.border,
  },
  yourStoryAvatar: {
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  yourStoryPlus: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: "300",
  },
  storyUsername: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    marginTop: 50,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: "center",
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
    fontWeight: "bold",
  },
});

export default FeedScreen;
