import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import { colors, spacing, typography } from "../../theme";
import { communityService } from "../../api/communityService";
import PostItem from "./components/PostItem";

const CommunityDetailScreen = ({ route, navigation }) => {
  const { communityId } = route.params;
  const { user } = useSelector((state) => state.auth);
  const [community, setCommunity] = useState(null);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingJoinRequests, setPendingJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("approved"); // approved, pendingPosts, pendingRequests
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [moderatorModalVisible, setModeratorModalVisible] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [moderatorUserId, setModeratorUserId] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    fetchCommunityDetails();
    fetchApprovedPosts();
    if (isModerator || isCreator) {
      fetchPendingPosts();
      fetchPendingJoinRequests();
    }
  }, [communityId, isModerator, isCreator]);

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      // Note: Swagger doesn't provide an endpoint to fetch community details, assuming one exists
      const response = await communityService.getMyCommunities();
      const communityData = response.find((c) => c._id === communityId);
      if (!communityData) throw new Error("Community not found");
      setCommunity(communityData);
      setIsMember(communityData.members?.includes(user._id));
      setIsModerator(communityData.moderators?.includes(user._id));
      setIsCreator(communityData.creator === user._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedPosts = async () => {
    try {
      const response = await communityService.getApprovedPosts(communityId);
      setApprovedPosts(response || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPendingPosts = async () => {
    try {
      const response = await communityService.getPendingPosts(communityId);
      setPendingPosts(response || []);
    } catch (err) {
      if (err.message.includes("No permission")) {
        setIsModerator(false);
        setIsCreator(false);
      } else {
        setError(err.message);
      }
    }
  };

  const fetchPendingJoinRequests = async () => {
    try {
      // Note: Swagger doesn't provide an endpoint for fetching pending join requests
      // Assuming a hypothetical endpoint like `/community/{communityId}/requests/pending`
      // Replace with actual endpoint when available
      setPendingJoinRequests([]); // Placeholder
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinCommunity = async () => {
    try {
      await communityService.joinCommunity(communityId);
      setIsMember(true);
      Alert.alert("Success", "You have joined the community!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await communityService.leaveCommunity(communityId);
      setIsMember(false);
      setIsModerator(false);
      Alert.alert("Success", "You have left the community!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleInviteUser = async () => {
    try {
      await communityService.inviteToCommunity(communityId, inviteUserId);
      setInviteModalVisible(false);
      setInviteUserId("");
      Alert.alert("Success", "User invited successfully!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleAddModerator = async () => {
    try {
      await communityService.addModerator(communityId, moderatorUserId);
      setModeratorModalVisible(false);
      setModeratorUserId("");
      Alert.alert("Success", "Moderator added successfully!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await communityService.approvePost(postId);
      setPendingPosts(pendingPosts.filter((post) => post._id !== postId));
      fetchApprovedPosts(); // Refresh approved posts
      Alert.alert("Success", "Post approved successfully!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleRejectPost = async (postId) => {
    try {
      await communityService.rejectPost(postId);
      setPendingPosts(pendingPosts.filter((post) => post._id !== postId));
      Alert.alert("Success", "Post rejected successfully!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleApproveJoinRequest = async (userId) => {
    try {
      await communityService.approveJoinRequest(communityId, userId);
      setPendingJoinRequests(
        pendingJoinRequests.filter((req) => req.userId !== userId)
      );
      Alert.alert("Success", "Join request approved!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleRejectJoinRequest = async (userId) => {
    try {
      await communityService.rejectJoinRequest(communityId, userId);
      setPendingJoinRequests(
        pendingJoinRequests.filter((req) => req.userId !== userId)
      );
      Alert.alert("Success", "Join request rejected!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const renderCommunityHeader = () => {
    if (!community) return null;
    return (
      <View style={styles.communityHeader}>
        {community.banner ? (
          <Image source={{ uri: community.banner }} style={styles.banner} />
        ) : (
          <View style={[styles.banner, styles.defaultBanner]} />
        )}
        <View style={styles.communityInfo}>
          {community.avatar ? (
            <Image source={{ uri: community.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.defaultAvatarText}>{community.name[0]}</Text>
            </View>
          )}
          <Text style={styles.communityName}>{community.name}</Text>
          <Text style={styles.communityDescription}>
            {community.description || "No description"}
          </Text>
          <Text style={styles.communityPrivacy}>
            {community.privacy === "public" ? "Public" : "Private"}
          </Text>
          <View style={styles.actionButtons}>
            {isMember ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.leaveButton]}
                  onPress={handleLeaveCommunity}
                >
                  <Text style={styles.actionButtonText}>Leave</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("CreateCommunityPost", { communityId })
                  }
                >
                  <Text style={styles.actionButtonText}>Create Post</Text>
                </TouchableOpacity>
                {(isModerator || isCreator) && (
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        activeTab === "approved" && styles.tabButtonActive,
                      ]}
                      onPress={() => setActiveTab("approved")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "approved" && styles.tabTextActive,
                        ]}
                      >
                        Posts
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        activeTab === "pendingPosts" && styles.tabButtonActive,
                      ]}
                      onPress={() => setActiveTab("pendingPosts")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "pendingPosts" && styles.tabTextActive,
                        ]}
                      >
                        Pending Posts
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        activeTab === "pendingRequests" &&
                          styles.tabButtonActive,
                      ]}
                      onPress={() => setActiveTab("pendingRequests")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "pendingRequests" &&
                            styles.tabTextActive,
                        ]}
                      >
                        Join Requests
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {(isModerator || isCreator) && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setInviteModalVisible(true)}
                  >
                    <Text style={styles.actionButtonText}>Invite</Text>
                  </TouchableOpacity>
                )}
                {isCreator && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setModeratorModalVisible(true)}
                  >
                    <Text style={styles.actionButtonText}>Add Moderator</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.joinButton]}
                onPress={handleJoinCommunity}
              >
                <Text style={styles.actionButtonText}>Join</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderPostItem = ({ item }) => <PostItem post={item} />;

  const renderPendingPostItem = ({ item }) => (
    <View style={styles.pendingPostItem}>
      <PostItem post={item} />
      <View style={styles.pendingActions}>
        <TouchableOpacity
          style={[styles.pendingActionButton, styles.approveButton]}
          onPress={() => handleApprovePost(item._id)}
        >
          <Text style={styles.pendingActionText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pendingActionButton, styles.rejectButton]}
          onPress={() => handleRejectPost(item._id)}
        >
          <Text style={styles.pendingActionText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPendingJoinRequestItem = ({ item }) => (
    <View style={styles.pendingPostItem}>
      <View style={styles.joinRequestInfo}>
        <Text style={styles.joinRequestText}>User ID: {item.userId}</Text>
        {/* Replace with user profile fetch if available */}
      </View>
      <View style={styles.pendingActions}>
        <TouchableOpacity
          style={[styles.pendingActionButton, styles.approveButton]}
          onPress={() => handleApproveJoinRequest(item.userId)}
        >
          <Text style={styles.pendingActionText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pendingActionButton, styles.rejectButton]}
          onPress={() => handleRejectJoinRequest(item.userId)}
        >
          <Text style={styles.pendingActionText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCommunityDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {activeTab === "approved"
            ? "No approved posts yet"
            : activeTab === "pendingPosts"
            ? "No pending posts"
            : "No pending join requests"}
        </Text>
        {isMember && activeTab === "approved" && (
          <Text style={styles.emptySubText}>
            Create a post to share with the community!
          </Text>
        )}
      </View>
    );
  };

  const getDataForTab = () => {
    switch (activeTab) {
      case "approved":
        return approvedPosts;
      case "pendingPosts":
        return pendingPosts;
      case "pendingRequests":
        return pendingJoinRequests;
      default:
        return [];
    }
  };

  const getRenderItemForTab = () => {
    switch (activeTab) {
      case "approved":
        return renderPostItem;
      case "pendingPosts":
        return renderPendingPostItem;
      case "pendingRequests":
        return renderPendingJoinRequestItem;
      default:
        return renderPostItem;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{community?.name || "Community"}</Text>
      </View>
      <FlatList
        data={getDataForTab()}
        renderItem={getRenderItemForTab()}
        keyExtractor={(item) =>
          item._id?.toString() || Math.random().toString()
        }
        ListHeaderComponent={renderCommunityHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite User</Text>
            <TextInput
              style={styles.input}
              placeholder="User ID to Invite"
              value={inviteUserId}
              onChangeText={setInviteUserId}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setInviteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleInviteUser}
                disabled={!inviteUserId}
              >
                <Text style={styles.createButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={moderatorModalVisible}
        onRequestClose={() => setModeratorModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Moderator</Text>
            <TextInput
              style={styles.input}
              placeholder="User ID to Promote"
              value={moderatorUserId}
              onChangeText={setModeratorUserId}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModeratorModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleAddModerator}
                disabled={!moderatorUserId}
              >
                <Text style={styles.createButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  communityHeader: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  banner: {
    width: "100%",
    height: 150,
    backgroundColor: colors.border,
  },
  defaultBanner: {
    backgroundColor: colors.primaryLight,
  },
  communityInfo: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.white,
    marginTop: -40,
  },
  defaultAvatar: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
  },
  communityName: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.sm,
  },
  communityDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  communityPrivacy: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    margin: spacing.xs,
  },
  joinButton: {
    backgroundColor: colors.success,
  },
  leaveButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: spacing.sm,
  },
  tabButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
  },
  tabButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  pendingPostItem: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  joinRequestInfo: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinRequestText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  pendingActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.sm,
  },
  pendingActionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginLeft: spacing.sm,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  pendingActionText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
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
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: spacing.sm,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  createButton: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
  },
});

export default CommunityDetailScreen;
