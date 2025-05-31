import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../hooks/useAuth'; // Để lấy thông tin người dùng hiện tại
// Giả sử chúng ta sẽ cập nhật dummyUser, cần import thêm
import { dummyUsers } from '../../utils/dummyData';

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=defaultUser';

const EditProfileScreen = ({ navigation }) => {
  const { user: currentUser, loading: authLoading } = useAuth(); // Lấy user từ hook
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    bio: '',
    website: '',
    pronouns: '',
    avatar: DEFAULT_AVATAR,
    email: '', // Email và phone sẽ không cho sửa trực tiếp ở đây
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        // Giả sử username lấy từ email, hoặc bạn có trường username riêng
        username: currentUser.username || currentUser.email?.split('@')[0] || '',
        bio: currentUser.bio || '',
        website: currentUser.website || '',
        pronouns: currentUser.pronouns || '', // Thêm pronouns nếu có
        avatar: currentUser.avatar || DEFAULT_AVATAR,
        email: currentUser.email || '',
        phone: currentUser.phone || 'N/A', // Giả sử có trường phone
      });
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsLoading(true);
    console.log('Saving profile data:', profileData);

    // --- Logic cập nhật Dummy Data (Tùy chọn) ---
    // Trong ứng dụng thực tế, bạn sẽ gọi API ở đây.
    // Để demo, chúng ta có thể thử cập nhật dummyUsers array.
    if (currentUser) {
      const userIndex = dummyUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        dummyUsers[userIndex] = {
          ...dummyUsers[userIndex],
          name: profileData.name,
          // username: profileData.username, // Cẩn thận nếu username là email
          bio: profileData.bio,
          avatar: profileData.avatar, // Giả sử avatar có thể thay đổi (cần logic chọn ảnh)
          website: profileData.website,
          pronouns: profileData.pronouns,
        };
        console.log('Dummy user updated:', dummyUsers[userIndex]);
      }
    }
    // --- Kết thúc Logic cập nhật Dummy Data ---

    // Giả lập quá trình lưu
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Profile Saved', 'Your profile has been updated (mock).', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      // navigation.goBack(); // Quay lại màn hình Profile
    }, 1000);
  };

  const handleEditProfilePhoto = () => {
    Alert.alert('Edit Photo', 'Functionality to change profile photo is not implemented yet.');
    // TODO: Implement image picker logic
    // Ví dụ: setProfileData(prev => ({ ...prev, avatar: 'new_image_uri' }));
  };

  if (authLoading && !currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="close-outline" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Profile Photo</Text>
        <View style={styles.profilePhotoContainer}>
          <Image source={{ uri: profileData.avatar }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editPhotoButton} onPress={handleEditProfilePhoto}>
            <Text style={styles.editPhotoButtonText}>Edit Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={profileData.name}
            onChangeText={text => handleInputChange('name', text)}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={profileData.username}
            onChangeText={text => handleInputChange('username', text)}
            placeholder="Enter your username"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={profileData.bio}
            onChangeText={text => handleInputChange('bio', text)}
            placeholder="Tell us about yourself"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={profileData.website}
            onChangeText={text => handleInputChange('website', text)}
            placeholder="yourwebsite.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pronouns</Text>
          <TextInput
            style={styles.input}
            value={profileData.pronouns}
            onChangeText={text => handleInputChange('pronouns', text)}
            placeholder="e.g., she/her, he/him, they/them"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <Text style={styles.sectionTitleSeparator}>Private Information</Text>
        <View style={styles.privateInfoItem}>
          <Text style={styles.privateInfoLabel}>Email</Text>
          <TouchableOpacity onPress={() => Alert.alert('Change Email', 'Functionality to change email is not implemented here.')}>
            <Text style={styles.privateInfoValueAction}>
              {profileData.email || 'N/A'} <Text style={styles.tapToChange}>Tap to change</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privateInfoItem}>
          <Text style={styles.privateInfoLabel}>Phone</Text>
          <TouchableOpacity onPress={() => Alert.alert('Change Phone', 'Functionality to change phone number is not implemented here.')}>
            <Text style={styles.privateInfoValueAction}>
              {profileData.phone || 'N/A'} <Text style={styles.tapToChange}>Tap to change</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    height: 56,
  },
  headerButton: {
    padding: spacing.xs,
    minWidth: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg -1,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    backgroundColor: colors.border, // Placeholder color
  },
  editPhotoButton: {
    backgroundColor: colors.background, // Màu xám nhạt như Figma
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  editPhotoButtonText: {
    color: colors.primary, // Chữ màu xanh
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  inputGroup: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background, // Nền input xám nhạt
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.md -2 : spacing.sm -2 , // Điều chỉnh padding
    fontSize: typography.fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border, // Viền mờ
    height: 50, // Chiều cao cố định cho input một dòng
  },
  bioInput: {
    height: 100, // Chiều cao cho bio input
    textAlignVertical: 'top', // Quan trọng cho Android
    paddingTop: spacing.sm, // Điều chỉnh padding top cho multiline
  },
  sectionTitleSeparator: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  privateInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  privateInfoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  privateInfoValueAction: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  tapToChange: {
    color: colors.primary,
    marginLeft: spacing.xs,
  },
});

export default EditProfileScreen;