import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts } from '../../redux/actions/postsActions';
import { colors, spacing } from '../../theme';
import PostItem from './components/PostItem';
// Import dummy data for testing if API not available
// import { dummyPosts } from '../../utils/dummyData';

const FeedScreen = () => {
  const dispatch = useDispatch();
  const { posts = [], loading, error, hasMore, page = 1 } = useSelector(state => state.posts || {});
  const [refreshing, setRefreshing] = useState(false);
  // Use for testing if API not available
  // const [localPosts, setLocalPosts] = useState(dummyPosts);

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

  // Add safety check to ensure post has required properties
  const renderItem = ({ item }) => {
    // Check if post has the minimum required properties
    if (!item || !item.author) {
      return null;
    }
    
    // Make sure author has required fields
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
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => (item.id || Math.random().toString()).toString()}
        contentContainerStyle={styles.listContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContentContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
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