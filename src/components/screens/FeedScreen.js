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
  Platform
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts } from '../../redux/actions/postsActions';
import { colors } from '../../theme';
import PostItem from './components/PostItem';

// Dummy stories data for the UI (we'll add this functionality later)
const STORIES = [
  { id: 'your-story', username: 'Your Story', avatar: null, hasStory: false, isYourStory: true },
  { id: 'user1', username: 'karennn', avatar: 'https://randomuser.me/api/portraits/women/79.jpg', hasStory: true, isLive: true },
  { id: 'user2', username: 'zackjohn', avatar: 'https://randomuser.me/api/portraits/men/86.jpg', hasStory: true },
  { id: 'user3', username: 'kiero_d', avatar: 'https://randomuser.me/api/portraits/men/29.jpg', hasStory: true },
  { id: 'user4', username: 'craig_love', avatar: 'https://randomuser.me/api/portraits/men/40.jpg', hasStory: true },
];

const StoryItem = ({ item }) => {
  return (
    <TouchableOpacity style={styles.storyContainer}>
      <View style={[
        styles.storyAvatarBorder,
        item.hasStory ? styles.hasStoryBorder : styles.noStoryBorder
      ]}>
        <View style={styles.storyAvatar}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.yourStoryPlus}>
              <Text style={styles.plusText}>+</Text>
            </View>
          )}
        </View>
        {item.isLive && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {item.isYourStory ? 'Your Story' : item.username}
      </Text>
    </TouchableOpacity>
  );
};

const FeedScreen = () => {
  const dispatch = useDispatch();
  const { posts = [], loading, error, hasMore, page = 1 } = useSelector(state => state.posts || {});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    try {
      dispatch(fetchPosts(1));
    } catch (err) {
      console.log("Error loading posts:", err);
    }
  };

  const loadMorePosts = () => {
    if (hasMore && !loading) {
      try {
        dispatch(fetchPosts(page + 1));
      } catch (err) {
        console.log("Error loading more posts:", err);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    try {
      dispatch(fetchPosts(1))
        .finally(() => {
          setRefreshing(false);
        });
    } catch (err) {
      console.log("Error refreshing posts:", err);
      setRefreshing(false);
    }
  };

  // Header component with stories
  const ListHeaderComponent = () => (
    <FlatList
      horizontal
      data={STORIES}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <StoryItem item={item} />}
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
      contentContainerStyle={styles.storiesContent}
    />
  );

  // Render single post
  const renderItem = ({ item }) => {
    if (!item || !item.author) {
      return null;
    }

    const safeItem = {
      ...item,
      author: {
        name: item.author.name || 'Unknown',
        avatar: item.author.avatar || null,
        ...item.author
      },
      comments: item.comments || [],
      likes: item.likes || 0
    };

    return <PostItem post={safeItem} />;
  };

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading && page === 1) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>
            Something went wrong. Please try again.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubText}>
          Be the first to share something with your friends.
        </Text>
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerLogo}>Drama Social</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.addPostIcon}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.messageIcon]}>
              <Text style={styles.messageCount}>2</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => (item.id || Math.random().toString()).toString()}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyComponent}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Noteworthy' : 'normal',
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  addPostIcon: {
    fontSize: 28,
    marginTop: -5,
  },
  messageIcon: {
    borderWidth: 1.5,
    borderRadius: 12,
    borderColor: '#262626',
    transform: [{ rotate: '-20deg' }],
  },
  messageCount: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fe0000',
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    overflow: 'hidden',
  },
  storiesContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  storiesContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  storyAvatarBorder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  hasStoryBorder: {
    padding: 2,
    borderWidth: 2,
    borderColor: '#c837ab',
    borderRadius: 36,
  },
  noStoryBorder: {},
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  yourStoryPlus: {
    backgroundColor: '#0095f6',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: 'white',
  },
  plusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  liveIndicator: {
    position: 'absolute',
    bottom: -3,
    backgroundColor: '#ff0000',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  liveText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  storyUsername: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 64,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
});

export default FeedScreen;