import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { colors, spacing, typography } from "../../theme";
import { communityService } from "../../api/communityService";
import Icon from "react-native-vector-icons/Ionicons";

const CreateCommunityPostScreen = ({ route, navigation }) => {
  const { communityId } = route.params;
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Post content is required");
      return;
    }
    try {
      setLoading(true);
      await communityService.createPost(communityId, { content, image });
      Alert.alert("Success", "Post submitted for approval!");
      navigation.navigate("CommunityDetail", { communityId });
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={styles.postButton}
          onPress={handleCreatePost}
          disabled={loading || !content.trim()}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <TextInput
          style={styles.contentInput}
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
        />
        <TextInput
          style={styles.imageInput}
          placeholder="Image URL (optional)"
          value={image}
          onChangeText={setImage}
        />
        {loading && (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color={colors.primary}
          />
        )}
      </View>
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
    color: colors.text,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  postButton: {
    padding: spacing.sm,
  },
  postButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  contentInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    textAlignVertical: "top",
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  imageInput: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  loading: {
    marginTop: spacing.lg,
  },
});

export default CreateCommunityPostScreen;
