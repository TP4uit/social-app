import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions,
  // ScrollView, // Không cần ScrollView riêng vì FlatList sẽ cung cấp khả năng cuộn
  // Alert // Alert chỉ dùng cho logout, đã chuyển sang SettingsScreen
} from "react-native";
import { colors, spacing, typography } from "../../theme"; //
import { useAuth } from "../../hooks/useAuth";

// Mock data for grid posts
// Sử dụng seed để đảm bảo ảnh giống nhau mỗi lần load, và đổi id để tránh cache
const GRID_POSTS = Array.from({ length: 15 }, (_, i) => ({
  id: `grid-post-${i + 1}`,
  image: `https://picsum.photos/seed/${i + 20}/300/300`,
}));

const { width } = Dimensions.get("window");
// Tính toán kích thước ảnh lưới để có 3 cột và các khoảng trống nhỏ giữa chúng
const POST_SIZE = (width - spacing.xs * 4) / 3;

// Dữ liệu mẫu cho Profile dựa trên Figma
const FIGMA_USER_DATA = {
  name: "Sophia",
  username: "sophia.d", // Không có @ ở đây, sẽ thêm vào khi hiển thị
  avatar: "https://i.pravatar.cc/150?img=4", // Sử dụng pravatar cho ảnh đại diện giống người hơn
  postsCount: 234,
  followersCount: "1.2K", // Giữ nguyên định dạng string nếu muốn hiển thị "K"
  followingCount: 876,
  bio: "Digital artist and storyteller. Sharing my journey and creations.",
  website: "www.sophiadrawn.com",
};

// Dữ liệu mẫu cho Story Highlights từ Figma
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
  // Thêm một vài mục nữa để có thể cuộn
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

// Dữ liệu cho các Tab điều hướng (Posts, Reels, Tagged)
const TABS = [
  { id: "posts", title: "Posts", icon: "罒" }, // Biểu tượng lưới/ô vuông
  { id: "reels", title: "Reels", icon: "▷" }, // Biểu tượng play/tam giác
  { id: "tagged", title: "Tagged", icon: "#" }, // Biểu tượng thẻ/hashtag
];

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth(); // Lấy thông tin người dùng từ Redux store
  const [activeTab, setActiveTab] = useState(TABS[0].id); // Mặc định chọn tab Posts

  // Sử dụng dữ liệu người dùng từ Redux nếu có, nếu không thì dùng dữ liệu Figma mẫu
  const currentUserData = user
    ? {
        name: user.username || FIGMA_USER_DATA.name,
        username: user.email?.split("@")[0] || FIGMA_USER_DATA.username,
        avatar: user.avatar || FIGMA_USER_DATA.avatar,
        postsCount:
          user.posts !== undefined ? user.posts : FIGMA_USER_DATA.postsCount,
        followersCount:
          user.followers !== undefined
            ? user.followers
            : FIGMA_USER_DATA.followersCount,
        followingCount:
          user.following !== undefined
            ? user.following
            : FIGMA_USER_DATA.followingCount,
        bio: user.bio || FIGMA_USER_DATA.bio,
        website: user.website || FIGMA_USER_DATA.website,
      }
    : FIGMA_USER_DATA;

  // Hàm điều hướng đến màn hình Settings
  const handleGoToSettings = () => {
    navigation.navigate("Settings");
  };

  const handleGoToEditProfile = () => {
    navigation.navigate("EditProfile"); // Điều hướng đến EditProfileScreen
  };

  // Component render từng Highlight Item
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

  // Component render từng ảnh trong lưới bài đăng
  const GridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  // Component Header chính của FlatList (chứa thông tin profile, stats, highlights, tabs)
  const renderHeaderContent = () => (
    <>
      {/* Profile Header Info (Avatar, Name, Username) */}
      <View style={styles.profileHeaderContent}>
        <Image
          source={{ uri: currentUserData.avatar }}
          style={styles.profileImage}
        />
        <View style={styles.profileTextInfo}>
          <Text style={styles.profileName}>{currentUserData.name}</Text>
          <Text style={styles.profileUsername}>
            @{currentUserData.username}
          </Text>
        </View>
      </View>

      {/* Stats (Posts, Followers, Following) */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUserData.postsCount}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUserData.followersCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{currentUserData.followingCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Bio and Website */}
      {(currentUserData.bio || currentUserData.website) && (
        <View style={styles.bioContainer}>
          {currentUserData.bio && (
            <Text style={styles.bioText} numberOfLines={3}>
              {currentUserData.bio}
            </Text>
          )}
          {currentUserData.website && (
            <TouchableOpacity
              onPress={() => {
                /* Xử lý mở link website */
              }}
            >
              <Text style={styles.websiteText}>{currentUserData.website}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Action Buttons (Edit Profile, Settings) */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editProfileButton]}
          onPress={handleGoToEditProfile} // Gọi hàm điều hướng
        >
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.settingsButton]}
          onPress={handleGoToSettings}
        >
          <Text style={styles.actionButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Story Highlights */}
      <View>
        <FlatList
          data={FIGMA_HIGHLIGHTS}
          keyExtractor={(item) => item.id}
          renderItem={HighlightItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.highlightsContainer}
          contentContainerStyle={styles.highlightsContent}
        />
      </View>

      {/* Tabs for Posts, Reels, Tagged */}
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
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        {/* Nút quay lại */}
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : {})}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        {/* Tên người dùng */}
        <Text style={styles.topHeaderTitle}>{currentUserData.name}</Text>
        {/* Nút Menu/Settings */}
        <TouchableOpacity
          onPress={handleGoToSettings}
          style={styles.topSettingsButtonContainer}
        >
          <Text style={styles.topSettingsIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Main content: Profile info + Post Grid */}
      <FlatList
        data={GRID_POSTS} // Sẽ cần logic để thay đổi dữ liệu theo activeTab (ví dụ: dùng state để lọc/fetch data)
        renderItem={GridItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={renderHeaderContent} // Toàn bộ phần trên lưới ảnh
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridListContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white, // Nền trắng cho toàn bộ màn hình
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    height: 50, // Chiều cao cố định của header trên cùng
    backgroundColor: colors.white,
    // Không có viền dưới theo Figma
  },
  backButtonContainer: {
    padding: spacing.xs,
    minWidth: 30, // Đảm bảo vùng chạm đủ rộng
    alignItems: "flex-start",
  },
  backButtonText: {
    fontSize: 28, // Kích thước icon mũi tên
    color: colors.black, // Màu đen
    fontWeight: "300", // Độ đậm mảnh
  },
  topHeaderTitle: {
    fontSize: typography.fontSize.lg, // Kích thước chữ tên người dùng
    fontWeight: "bold",
    color: colors.black, // Màu đen
  },
  topSettingsButtonContainer: {
    padding: spacing.xs,
    minWidth: 30,
    alignItems: "flex-end",
  },
  topSettingsIcon: {
    fontSize: 24, // Kích thước icon ba chấm
    color: colors.black, // Màu đen
    fontWeight: "bold", // Độ đậm
  },
  profileHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  profileImage: {
    width: 90, // Kích thước avatar (nhỏ hơn 96px một chút theo Figma)
    height: 90,
    borderRadius: 45, // Bo tròn hoàn hảo
    // border: không có viền theo Figma
  },
  profileTextInfo: {
    marginLeft: spacing.xl, // Khoảng cách lớn hơn một chút
    justifyContent: "center",
  },
  profileName: {
    fontSize: typography.fontSize.xxl, // Tên lớn hơn
    fontWeight: "bold",
    color: colors.text,
  },
  profileUsername: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2, // Khoảng cách nhỏ
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white, // Nền trắng
    borderRadius: 8, // Bo góc cho thanh stats
    borderWidth: 1, // Viền rất mỏng
    borderColor: colors.border, // Màu viền nhẹ
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
    lineHeight: typography.fontSize.sm * 1.4, // Tăng line height cho dễ đọc
  },
  websiteText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary, // Màu xanh dương
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2, // Tăng chiều cao nút một chút
    borderRadius: 8, // Bo tròn nhiều hơn
    backgroundColor: colors.white, // Nền trắng cho nút
    borderWidth: 1, // Viền mỏng cho nút
    borderColor: colors.border, // Màu viền xám nhạt
    alignItems: "center",
    justifyContent: "center",
  },
  editProfileButton: {
    marginRight: spacing.sm,
  },
  settingsButton: {
    marginLeft: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: "bold",
    color: colors.text, // Chữ màu đen
  },
  highlightsContainer: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  highlightsContent: {
    paddingHorizontal: spacing.lg, // Lề hai bên cho cuộn ngang
  },
  highlightItem: {
    alignItems: "center",
    marginRight: spacing.md,
    width: 68, // Chiều rộng cố định cho mỗi highlight
  },
  highlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30, // Hoàn toàn tròn
    borderWidth: 1, // Viền mỏng
    borderColor: colors.border, // Viền xám nhạt
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
    backgroundColor: colors.background, // Nền xám nhạt
  },
  addHighlightIcon: {
    fontSize: typography.fontSize.xl, // Kích thước dấu cộng
    color: colors.textSecondary, // Màu xám cho dấu cộng
  },
  highlightImage: {
    width: 58, // Nhỏ hơn circle một chút để tạo hiệu ứng viền
    height: 58,
    borderRadius: 29,
  },
  highlightTitle: {
    fontSize: typography.fontSize.xs - 1, // Chữ tiêu đề nhỏ hơn
    color: colors.text, // Màu đen
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginTop: spacing.md, // Khoảng cách từ highlights
  },
  tabButton: {
    flex: 1, // Chia đều không gian
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  activeTabButton: {
    borderBottomWidth: 2, // Gạch chân đậm hơn cho tab active
    borderBottomColor: colors.black, // Gạch chân màu đen
  },
  tabIcon: {
    fontSize: 20, // Kích thước icon tab
    color: colors.textSecondary, // Màu xám cho icon không active
  },
  activeTabIcon: {
    color: colors.black, // Màu đen cho icon active
  },
  gridListContent: {
    paddingHorizontal: spacing.xs / 2, // Khoảng cách rất nhỏ cho lề ngoài của grid
    paddingBottom: spacing.lg, // Padding cuối danh sách
  },
  gridItem: {
    width: POST_SIZE,
    height: POST_SIZE,
    padding: spacing.xs / 2, // Khoảng cách giữa các ảnh
  },
  gridImage: {
    flex: 1,
    borderRadius: 2, // Bo góc rất nhẹ
    backgroundColor: colors.border, // Màu nền khi ảnh chưa load
  },
});

export default ProfileScreen;
