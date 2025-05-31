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
import { createPost as createPostAction } from '../../redux/actions/postsActions';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/Ionicons';

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=defaultUser';

const CreatePostScreen = ({ navigation, route }) => {
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const dispatch = useDispatch();
  const { creating, createError } = useSelector(state => state.posts);
  const { user } = useAuth();

  const currentUserAvatar = user?.avatar || DEFAULT_AVATAR;

  useEffect(() => {
    if (route.params?.imageUri) {
      setImageUri(route.params.imageUri);
      navigation.setParams({ imageUri: null });
    }
  }, [route.params?.imageUri, navigation]);

  const validateForm = () => {
    if (!content.trim() && !imageUri) { // Cần có nội dung hoặc ảnh
      setContentError('Please write something or add an image for your post.');
      return false;
    }
    setContentError('');
    return true;
  };

  const handleCreatePost = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(createPostAction({ content, image: imageUri }));
      setContent('');
      setImageUri(null);
      navigation.navigate('Feed');
    } catch (error) {
      console.log('Create post error:', error);
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
          disabled={creating || (!content.trim() && !imageUri) }
        >
          <Text style={[
            styles.postButtonText,
            (!content.trim() && !imageUri || creating) && styles.postButtonTextDisabled
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
                  if (contentError && (text.trim() || imageUri)) setContentError('');
                }}
                multiline
                style={styles.textInput}
                scrollEnabled={true}
                maxHeight={200}
              />
            </View>
            {contentError ? <Text style={styles.inlineErrorText}>{contentError}</Text> : null}
            
            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageButton}>
                  <Icon name="close-circle" size={28} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}

            {createError && (
                <View style={styles.apiErrorContainer}>
                    <Text style={styles.apiErrorText}>{createError}</Text>
                </View>
            )}

            <View style={styles.iconToolbar}>
              <TouchableOpacity 
                style={styles.toolbarIconWrapper}
                onPress={() => navigation.navigate('Camera', { source: 'CreatePost' })}
              >
                <Icon name="camera-outline" size={26} color={colors.primary} />
              </TouchableOpacity>
               <TouchableOpacity 
                style={styles.toolbarIconWrapper}
                onPress={() => navigation.navigate('Camera', { source: 'CreatePost', pickOnly: true })}
              >
                <Icon name="images-outline" size={26} color={colors.primary} />
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
    minWidth: 50,
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
    color: colors.textSecondary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  mainContentContainer: {
    flex: 1,
    padding: spacing.md,
    margin: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    textAlignVertical: 'top',
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    paddingBottom: spacing.sm,
    lineHeight: typography.fontSize.md * 1.5,
  },
  inlineErrorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: 50, 
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
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  toolbarIconWrapper: {
    padding: spacing.sm,
  },
  imagePreviewContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1, // Hoặc một tỷ lệ khác bạn muốn
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    padding: 3,
  },
});

export default CreatePostScreen;