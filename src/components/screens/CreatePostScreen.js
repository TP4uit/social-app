import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createPost as createPostAction } from '../../redux/actions/postsActions'; // Đổi tên để tránh trùng với tên component
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../hooks/useAuth'; // Để lấy thông tin user
import Icon from 'react-native-vector-icons/Ionicons'; // Sử dụng Ionicons

// Placeholder avatar nếu user không có
const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=defaultUser';

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');

  const dispatch = useDispatch();
  const { creating, createError } = useSelector(state => state.posts);
  const { user } = useAuth(); // Lấy thông tin người dùng hiện tại

  const currentUserAvatar = user?.avatar || DEFAULT_AVATAR;

  const validateForm = () => {
    if (!content.trim()) {
      setContentError('Please write something for your post.');
      return false;
    }
    setContentError('');
    return true;
  };

  const handleCreatePost = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(createPostAction({ content })); // Sử dụng tên đã đổi
      setContent('');
      navigation.navigate('Feed');
    } catch (error) {
      console.log('Create post error:', error);
      // Lỗi đã được xử lý bởi redux state (createError)
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="close-outline" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          onPress={handleCreatePost}
          style={styles.headerButton}
          disabled={creating || !content.trim()} // Disable khi đang tạo hoặc không có nội dung
        >
          <Text style={[
            styles.postButtonText,
            (!content.trim() || creating) && styles.postButtonTextDisabled
          ]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -StatusBar.currentHeight || 0}

      >
        <ScrollView contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.mainContentContainer}>
            <View style={styles.inputArea}>
              <Image source={{ uri: currentUserAvatar }} style={styles.avatar} />
              <TextInput
                placeholder="What's on your mind?"
                placeholderTextColor={colors.textSecondary}
                value={content}
                onChangeText={text => {
                  setContent(text);
                  if (contentError && text.trim()) setContentError('');
                }}
                multiline
                style={styles.textInput}
                scrollEnabled={true} // Cho phép cuộn nếu text dài
                maxHeight={200} // Giới hạn chiều cao tối đa, có thể điều chỉnh
              />
            </View>
            {contentError ? <Text style={styles.inlineErrorText}>{contentError}</Text> : null}
            {createError && ( // Hiển thị lỗi chung từ API
                <View style={styles.apiErrorContainer}>
                    <Text style={styles.apiErrorText}>{createError}</Text>
                </View>
            )}

            <View style={styles.iconToolbar}>
              <TouchableOpacity style={styles.toolbarIconWrapper}>
                <Icon name="camera-outline" size={26} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarIconWrapper}>
                <Icon name="pricetag-outline" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarIconWrapper}>
                <Icon name="location-outline" size={26} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarIconWrapper}>
                <Icon name="happy-outline" size={26} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolbarIconWrapper}>
                <Icon name="people-outline" size={26} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
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
    minWidth: 50, // Đảm bảo vùng nhấn đủ rộng
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  postButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
  postButtonTextDisabled: {
    color: colors.textSecondary, // Màu chữ mờ đi khi disable
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  mainContentContainer: {
    flex: 1, // Để toolbar đẩy xuống dưới nếu text input không chiếm hết
    padding: spacing.md,
    margin: spacing.md,
    backgroundColor: colors.white, // Hoặc một màu nền rất nhạt nếu cần
    borderRadius: 12, // Bo góc cho container
    borderWidth: 1,
    borderColor: colors.border, // Viền mờ
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Để avatar ở trên cùng
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginTop: spacing.xs, // Căn chỉnh với dòng text đầu tiên
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    textAlignVertical: 'top', // Quan trọng cho multiline trên Android
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.xs, // Điều chỉnh padding
    paddingBottom: spacing.sm,
    lineHeight: typography.fontSize.md * 1.5,
  },
  inlineErrorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: 50, // Căn thẳng với TextInput
  },
  apiErrorContainer: {
    backgroundColor: '#FEEEF0',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
  },
  apiErrorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
  },
  iconToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: 'auto', // Đẩy toolbar xuống cuối mainContentContainer
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm, // Thêm padding ngang cho toolbar
  },
  toolbarIconWrapper: {
    padding: spacing.sm,
  },
});

export default CreatePostScreen;