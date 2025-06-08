import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { colors, spacing, typography } from "../../theme";
import { useAuth } from "../../hooks/useAuth";

// Định nghĩa cấu trúc dữ liệu cho các mục cài đặt
const SETTINGS_SECTIONS = [
  {
    title: "Account",
    data: [
      {
        id: "personal_info",
        label: "Personal Information",
        icon: "👤",
        type: "navigate",
        screen: "EditProfile",
      },
      {
        id: "password_security",
        label: "Password & Security",
        icon: "🔒",
        type: "navigate",
        screen: "ChangePassword",
      }, // Updated
      {
        id: "payment_methods",
        label: "Payment Methods",
        icon: "💳",
        type: "navigate",
        screen: "PaymentMethods",
      },
    ],
  },
  {
    title: "Privacy & Security",
    data: [
      {
        id: "privacy_settings",
        label: "Privacy Settings",
        icon: "🛡️",
        type: "navigate",
        screen: "PrivacyOptions",
      },
      {
        id: "blocked_users",
        label: "Blocked Users",
        icon: "👥",
        type: "navigate",
        screen: "BlockedUsers",
      },
      {
        id: "two_factor",
        label: "Two-Factor Authentication",
        icon: "🔑",
        type: "navigate",
        screen: "TwoFactorAuth",
      },
    ],
  },
  {
    title: "Notifications",
    data: [
      {
        id: "push_notifications",
        label: "Push Notifications",
        icon: "🔔",
        type: "navigate",
        screen: "PushNotificationSettings",
      },
      {
        id: "email_notifications",
        label: "Email Notifications",
        icon: "✉️",
        type: "navigate",
        screen: "EmailNotificationSettings",
      },
    ],
  },
  {
    title: "Preferences",
    data: [
      {
        id: "language",
        label: "Language",
        icon: "🌐",
        type: "value_navigate",
        value: "English",
        screen: "LanguageSettings",
      },
      {
        id: "dark_mode",
        label: "Dark Mode",
        icon: "🌙",
        type: "switch",
        stateKey: "darkModeEnabled",
      },
    ],
  },
  {
    title: "Support",
    data: [
      {
        id: "help_center",
        label: "Help Center",
        icon: "❓",
        type: "navigate",
        screen: "HelpCenter",
      },
      {
        id: "contact_support",
        label: "Contact Support",
        icon: "🎧",
        type: "navigate",
        screen: "ContactSupport",
      },
    ],
  },
  {
    title: "About",
    data: [
      {
        id: "terms_service",
        label: "Terms of Service",
        icon: "📄",
        type: "navigate",
        screen: "TermsOfService",
      },
      {
        id: "privacy_policy",
        label: "Privacy Policy",
        icon: "📄",
        type: "navigate",
        screen: "PrivacyPolicy",
      },
      {
        id: "app_version",
        label: "App Version",
        icon: "ℹ️",
        type: "value_only",
        value: "1.2.3",
      },
    ],
  },
];

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();

  // Quản lý trạng thái cho các Switch
  const [switches, setSwitches] = React.useState({
    darkModeEnabled: false, // Giá trị khởi tạo
  });

  const toggleSwitch = (key) => {
    setSwitches((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Sau khi logout, AppNavigator sẽ tự động chuyển đến màn hình Login
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  // Component render từng mục cài đặt
  const SettingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() =>
        item.type === "navigate" || item.type === "value_navigate"
          ? navigation.navigate(item.screen)
          : {}
      }
      disabled={item.type === "switch" || item.type === "value_only"} // Vô hiệu hóa onPress cho switch và value_only
    >
      <Text style={styles.itemIcon}>{item.icon}</Text>
      <Text style={styles.itemLabel}>{item.label}</Text>
      <View style={styles.itemRightContainer}>
        {item.type === "switch" && (
          <Switch
            value={switches[item.stateKey]}
            onValueChange={() => toggleSwitch(item.stateKey)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.border} // Cho iOS
          />
        )}
        {(item.type === "value_navigate" || item.type === "value_only") &&
          item.value && <Text style={styles.itemValue}>{item.value}</Text>}
        {(item.type === "navigate" || item.type === "value_navigate") && (
          <Text style={styles.itemArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
    >
      {SETTINGS_SECTIONS.map((section) => (
        <View key={section.title} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionItemsContainer}>
            {section.data.map((item, index) => (
              <View key={item.id}>
                <SettingItem item={item} />
                {index < section.data.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Nền xám rất nhạt cho toàn màn hình
  },
  scrollContentContainer: {
    paddingBottom: spacing.xxl, // Để có không gian cho nút logout ở cuối
  },
  sectionContainer: {
    marginTop: spacing.lg, // Khoảng cách giữa các section
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md, // Font to hơn cho tiêu đề section
    fontWeight: "bold",
    color: colors.textSecondary, // Màu xám cho tiêu đề section
    paddingHorizontal: spacing.lg, // Căn lề cho tiêu đề section
    marginBottom: spacing.sm, // Khoảng cách từ tiêu đề đến các item
  },
  sectionItemsContainer: {
    backgroundColor: colors.white, // Nền trắng cho các item trong section
    borderRadius: 10, // Bo góc cho cả khối item
    marginHorizontal: spacing.md, // Lề ngang cho khối item
    overflow: "hidden", // Để bo góc hoạt động với separator
    // Thêm một chút shadow nhẹ theo phong cách iOS (tùy chọn)
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md + 2, // Tăng padding dọc
    paddingHorizontal: spacing.lg, // Tăng padding ngang
    backgroundColor: colors.white, // Nền trắng cho từng item
  },
  itemIcon: {
    fontSize: typography.fontSize.lg, // Kích thước icon
    color: colors.textSecondary, // Màu icon
    marginRight: spacing.md,
    width: 24, // Chiều rộng cố định cho icon để các label thẳng hàng
    textAlign: "center",
  },
  itemLabel: {
    flex: 1, // Để label chiếm hết không gian còn lại
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  itemRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemValue: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  itemArrow: {
    fontSize: typography.fontSize.xl,
    color: colors.textSecondary, // Màu xám nhạt cho mũi tên
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 24 + spacing.md, // (padding trái của item + width icon + margin phải của icon)
  },
  logoutButton: {
    backgroundColor: colors.white, // Nền trắng cho nút logout (khác với Figma một chút để dễ nhìn hơn trên nền xám)
    // Hoặc dùng màu xám rất nhạt: colors.background (màu này giống Figma hơn)
    // Nếu dùng colors.background thì cần viền rõ hơn hoặc không viền
    paddingVertical: spacing.lg - 2,
    marginHorizontal: spacing.md,
    borderRadius: 10, // Bo góc giống các section item
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl, // Khoảng cách từ section cuối
    borderWidth: 1,
    borderColor: colors.border, // Thêm viền nhẹ
  },
  logoutButtonText: {
    color: colors.primary, // Chữ màu xanh primary
    fontSize: typography.fontSize.md,
    fontWeight: "bold", // Chữ đậm
  },
});

export default SettingsScreen;
