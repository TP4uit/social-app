// src/components/screens/CommunityDetailScreen.js
import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { colors, spacing, typography } from "../../theme";

const CommunityDetailScreen = ({ route }) => {
  const { communityId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Detail</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.communityId}>Community ID: {communityId}</Text>
        <Text style={styles.placeholderText}>
          Implement community details, posts, and actions here.
        </Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  communityId: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

export default CommunityDetailScreen;
