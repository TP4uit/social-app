// src/screens/OtherProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { colors, spacing, typography } from "../../theme";
import { profileService } from "../../api/profile";
import { postsService } from "../../api/posts";

// Mock data for highlights and posts (replace with API data)
const FIGMA_HIGHLIGHTS = [
  { id: "new-highlight", title: "New", isAdd: true, image: null },
  {
    id: "h-travel",
    title: "Travel",
    image: "https://picsum.photos/seed/travel_highlight/200",
  },
  {
    id: "h-art",
    title: "Art",
    image: "https://picsum.photos/seed/art_highlight/200",
  },
  {
    id: "h-life",
    title: "Life",
    image: "https://picsum.photos/seed/life_highlight/200",
  },
  {
    id: "h-friends",
    title: "Friends",
    image: "https://picsum.photos/seed/friends_highlight/200",
  },
  {
    id: "h-food",
    title: "Food",
    image: "https://picsum.photos/seed/food_highlight/200",
  },
  {
    id: "h-pets",
    title: "Pets",
    image: "https://picsum.photos/seed/pets_highlight/200",
  },
];

const TABS = [
  { id: "posts", title: "Posts", icon: "罒" },
  { id: "reels", title: "Reels", icon: "▷" },
  { id: "tagged", title: "Tagged", icon: "#" },
];

const { width } = Dimensions.get("window");
const POST_SIZE = (width - spacing.xs * 4) / 3;

const OtherProfileScreen = ({ navigation, route }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [isFollowThis, setIsFollowThis] = useState(false);
  const userId = route.params?.userId;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [profileResponse, postsResponse] = await Promise.all([
          profileService.fetchUserProfileById(userId),
          postsService.getPosts(),
        ]);
        const profileData = profileResponse.user;
        // Filter posts by userId
        const userPosts = postsResponse.data.filter(
          (post) => post.author?._id === userId
        );
        setProfile(profileData);
        setPosts(userPosts);
        setIsFollowing(profileData.isFollowing || false);
        setFollowersCount(profileData.followersCount || 0);
        const followingList = await profileService.getFollowing();
        const isUserFollowing = followingList.some(
          (followedUser) => followedUser._id === userId
        );
        setIsFollowThis(isUserFollowing);
        setError(null);
      } catch (err) {
        console.error("Fetch profile/posts error:", err.message);
        setError(err.message || "Failed to load profile or posts");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!userId) {
      console.warn("No userId provided for follow/unfollow");
      return;
    }
    try {
      setLoading(true);
      if (isFollowing) {
        // Placeholder for unfollowUser (missing from profileService)
        // Replace with actual endpoint when available, e.g., profileService.unfollowUser(userId)
        await profileService.followUser(userId); // Assuming toggle behavior
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await profileService.followUser(userId);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Follow/Unfollow error:", err.message);
      setError(err.message || "Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  // Fallback to mock data if profile is not loaded
  const userData = profile || {
    name: "Loading...",
    username: "loading",
    avatar: "https://i.pravatar.cc/150?u=defaultUser",
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    bio: "",
    website: "",
    highlights: FIGMA_HIGHLIGHTS,
  };

  // Use fetched posts if available, else fallback to mock posts
  const gridPosts = posts.length
    ? posts.map((post, index) => ({
        id: post._id,
        image:
          post.images?.[0] ||
          `https://picsum.photos/seed/${index + 20}/300/300`,
      }))
    : Array.from({ length: 15 }, (_, i) => ({
        id: `grid-post-${i + 1}`,
        image: `https://picsum.photos/seed/${i + 20}/300/300`,
      }));

  const HighlightItem = ({ item }) => (
    <TouchableOpacity style={styles.highlightItem}>
      <View style={styles.highlightCircle}>
        {item.isAdd ? (
          <Text style={styles.addHighlightIcon}>+</Text>
        ) : (
          <Image source={{ uri: item.image }} style={styles.highlightImage} />
        )}
      </View>
      <Text style={styles.highlightTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const GridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  const renderHeaderContent = () => (
    <>
      <View style={styles.profileHeaderContent}>
        <Image source={{ uri: userData.avatar }} style={styles.profileImage} />
        <View style={styles.profileTextInfo}>
          <Text style={styles.profileName}>{userData.username}</Text>
          <Text style={styles.profileUsername}>@{userData.username}</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.postsCount || 5}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{followersCount || 3}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.followingCount || 2}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>
      {(userData.bio || userData.website) && (
        <View style={styles.bioContainer}>
          {userData.bio && (
            <Text style={styles.bioText} numberOfLines={3}>
              {userData.bio}
            </Text>
          )}
          {userData.website && (
            <TouchableOpacity
              onPress={() => {
                /* Handle website link */
              }}
            >
              <Text style={styles.websiteText}>{userData.website}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.followButton,
            (isFollowing || isFollowThis) && styles.unfollowButton,
          ]}
          onPress={handleFollowToggle}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={isFollowing ? colors.textSecondary : colors.white}
            />
          ) : (
            <Text
              style={[
                styles.actionButtonText,
                isFollowing && styles.actionButtonTextUnfollow,
              ]}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View>
        <FlatList
          data={userData.highlights}
          keyExtractor={(item) => item.id}
          renderItem={HighlightItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.highlightsContainer}
          contentContainerStyle={styles.highlightsContent}
        />
      </View>
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === tab.id && styles.activeTabIcon,
              ]}
            >
              {tab.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : {})}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>{userData.username}</Text>
        <View style={styles.topSettingsButtonContainer} />
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchData();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={gridPosts}
        renderItem={GridItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={renderHeaderContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridListContent}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    height: 50,
    backgroundColor: colors.white,
  },
  backButtonContainer: {
    padding: spacing.xs,
    minWidth: 30,
    alignItems: "flex-start",
  },
  backButtonText: {
    fontSize: 28,
    color: colors.black,
    fontWeight: "300",
  },
  topHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.black,
  },
  topSettingsButtonContainer: {
    padding: spacing.xs,
    minWidth: 30,
    alignItems: "flex-end",
  },
  profileHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  profileTextInfo: {
    marginLeft: spacing.xl,
    justifyContent: "center",
  },
  profileName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: "bold",
    color: colors.text,
  },
  profileUsername: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  bioContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  bioText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: typography.fontSize.sm * 1.4,
  },
  websiteText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  followButton: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  unfollowButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "bold",
    color: colors.white,
  },
  actionButtonTextUnfollow: {
    color: colors.text,
  },
  highlightsContainer: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  highlightsContent: {
    paddingHorizontal: spacing.lg,
  },
  highlightItem: {
    alignItems: "center",
    marginRight: spacing.md,
    width: 68,
  },
  highlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  addHighlightIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary,
  },
  highlightImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  highlightTitle: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.text,
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginTop: spacing.md,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
  },
  tabIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  activeTabIcon: {
    color: colors.black,
  },
  gridListContent: {
    paddingHorizontal: spacing.xs / 2,
    paddingBottom: spacing.lg,
  },
  gridItem: {
    width: POST_SIZE,
    height: POST_SIZE,
    padding: spacing.xs / 2,
  },
  gridImage: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
});

export default OtherProfileScreen;
