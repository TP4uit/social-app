import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';

const SimpleCameraScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const { source, chatId, pickOnly } = route?.params || {};

  useEffect(() => {
    console.log('SimpleCameraScreen mounted with params:', { source, chatId, pickOnly });
    
    // If pickOnly is true, immediately open image picker
    if (pickOnly) {
      pickImageFromLibrary();
    } else {
      // Otherwise, show camera
      openCamera();
    }
  }, []);

  const handleGoBack = () => {
    try {
      if (navigation && navigation.goBack) {
        navigation.goBack();
      } else if (navigation && navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.error('Navigation not available or cannot go back');
        // Try to navigate to main screen as fallback
        if (navigation && navigation.navigate) {
          navigation.navigate('Feed');
        }
      }
    } catch (error) {
      console.error('Error navigating back:', error);
    }
  };

  const pickImageFromLibrary = async () => {
    try {
      setLoading(true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select images.',
          [{ text: 'OK', onPress: handleGoBack }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageSelected(result.assets[0].uri);
      } else {
        handleGoBack();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image', [
        { text: 'OK', onPress: handleGoBack }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    try {
      setLoading(true);
      
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your camera to take photos.',
          [{ text: 'OK', onPress: handleGoBack }]
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleImageSelected(result.assets[0].uri);
      } else {
        handleGoBack();
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera', [
        { text: 'OK', onPress: handleGoBack }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelected = (imageUri) => {
    if (!navigation || !navigation.navigate) {
      console.error('Navigation not available');
      return;
    }

    // Navigate back to the source screen with the image
    if (source === 'CreatePost') {
      navigation.navigate('CreatePost', { imageUri });
    } else if (source === 'Chat' && chatId) {
      navigation.navigate('GroupChat', { 
        chatId,
        imageUri,
        targetChatId: chatId 
      });
    } else if (source === 'EditProfile') {
      navigation.navigate('EditProfile', { imageUri });
    } else {
      // If no source specified, just go back
      handleGoBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {pickOnly ? 'Opening photo library...' : 'Opening camera...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Fallback UI if camera/picker doesn't open automatically
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {pickOnly ? 'Select Photo' : 'Take Photo'}
        </Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={pickOnly ? pickImageFromLibrary : openCamera}
        >
          <Icon 
            name={pickOnly ? "images-outline" : "camera-outline"} 
            size={48} 
            color={colors.primary} 
          />
          <Text style={styles.actionButtonText}>
            {pickOnly ? 'Open Photo Library' : 'Open Camera'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  actionButtonText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default SimpleCameraScreen;