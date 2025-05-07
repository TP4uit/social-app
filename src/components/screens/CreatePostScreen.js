// src/components/screens/CreatePostScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../redux/actions/postsActions';
import { colors, spacing, typography } from '../../theme';
import Input from '../common/Input';
import Button from '../common/Button';

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');
  
  const dispatch = useDispatch();
  const { creating, createError } = useSelector(state => state.posts);
  
  const validateForm = () => {
    if (!content.trim()) {
      setContentError('Please write something for your post');
      return false;
    }
    setContentError('');
    return true;
  };
  
  const handleCreatePost = async () => {
    if (!validateForm()) return;
    
    try {
      await dispatch(createPost({ content }));
      // Reset form
      setContent('');
      // Navigate to feed after post creation
      navigation.navigate('Feed');
    } catch (error) {
      console.log('Create post error:', error);
    }
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        {createError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{createError}</Text>
          </View>
        )}
        
        <Input
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={5}
          error={contentError}
          inputStyle={styles.inputStyle}
        />
        
        <Button
          title="Post"
          onPress={handleCreatePost}
          loading={creating}
          style={styles.postButton}
        />
      </View>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Add Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Tag People</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Add Location</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inputStyle: {
    height: 150,
    textAlignVertical: 'top',
  },
  postButton: {
    marginTop: spacing.md,
  },
  errorContainer: {
    backgroundColor: '#FEEEF0',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
  },
  optionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },
});

export default CreatePostScreen;