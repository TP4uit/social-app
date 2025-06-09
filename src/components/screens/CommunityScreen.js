import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import { colors, spacing, typography } from "../../theme";
import { communityService } from "../../api/communityService";

const CommunityItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.communityItem} onPress={onPress}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.communityAvatar} />
      ) : (
        <View style={[styles.communityAvatar, styles.defaultAvatar]}>
          <Text style={styles.defaultAvatarText}>{item.name[0]}</Text>
        </View>
      )}
      <View style={styles.communityInfo}>
        <Text style={styles.communityName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.communityDescription} numberOfLines={2}>
          {item.description || "No description"}
        </Text>
        <Text style={styles.communityPrivacy}>
          {item.privacy === "public" ? "Public" : "Private"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CommunityScreen = ({ navigation }) => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    privacy: "public",
  });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await communityService.getMyCommunities();
      setCommunities(response || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      setLoading(true);
      await communityService.createCommunity({
        ...newCommunity,
        avatar: "", // Optional: Add avatar upload logic later
        banner: "", // Optional: Add banner upload logic later
      });
      setModalVisible(false);
      setNewCommunity({ name: "", description: "", privacy: "public" });
      fetchCommunities(); // Refresh the list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <CommunityItem
      item={item}
      onPress={() =>
        navigation.navigate("CommunityDetail", { communityId: item._id })
      }
    />
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
            onPress={fetchCommunities}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No communities yet</Text>
        <Text style={styles.emptySubText}>
          Create or join a community to get started!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity
          style={styles.headerIconContainer}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add-circle-outline" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={communities}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item._id?.toString() || Math.random().toString()
        }
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Community</Text>
            <TextInput
              style={styles.input}
              placeholder="Community Name"
              value={newCommunity.name}
              onChangeText={(text) =>
                setNewCommunity({ ...newCommunity, name: text })
              }
            />
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description"
              value={newCommunity.description}
              onChangeText={(text) =>
                setNewCommunity({ ...newCommunity, description: text })
              }
              multiline
            />
            <View style={styles.privacyContainer}>
              <TouchableOpacity
                style={[
                  styles.privacyButton,
                  newCommunity.privacy === "public" &&
                    styles.privacyButtonActive,
                ]}
                onPress={() =>
                  setNewCommunity({ ...newCommunity, privacy: "public" })
                }
              >
                <Text
                  style={[
                    styles.privacyButtonText,
                    newCommunity.privacy === "public" &&
                      styles.privacyButtonTextActive,
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.privacyButton,
                  newCommunity.privacy === "private" &&
                    styles.privacyButtonActive,
                ]}
                onPress={() =>
                  setNewCommunity({ ...newCommunity, privacy: "private" })
                }
              >
                <Text
                  style={[
                    styles.privacyButtonText,
                    newCommunity.privacy === "private" &&
                      styles.privacyButtonTextActive,
                  ]}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateCommunity}
                disabled={loading || !newCommunity.name}
              >
                <Text style={styles.createButtonText}>Create</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  headerIconContainer: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
  communityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  communityAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
  },
  communityInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  communityName: {
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
    color: colors.text,
  },
  communityDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  communityPrivacy: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  privacyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  privacyButton: {
    flex: 1,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: spacing.xs,
  },
  privacyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  privacyButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  privacyButtonTextActive: {
    color: colors.primary,
    fontWeight: "bold",
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

export default CommunityScreen;
