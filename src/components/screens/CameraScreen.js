import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, SafeAreaView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';

const { width } = Dimensions.get('window');

const CameraScreen = () => {
  const navigation = useNavigation(); // SỬ DỤNG HOOK
  const route = useRoute();       // SỬ DỤNG HOOK

  console.log('--- CameraScreen Mounted (with hooks) ---');
  console.log('Hook Navigation:', JSON.stringify(navigation, null, 2));
  console.log('Hook Route:', JSON.stringify(route, null, 2));
  const { source, chatId, pickOnly } = route.params || {};

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(FlashMode.off);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const handleClosePress = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else {
      console.error("Hook navigation.goBack is not available");
    }
  };

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      setIsLoadingPermissions(true);
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === 'granted');
      setIsLoadingPermissions(false);
    })();
  }, []);

  useEffect(() => {
    if (pickOnly && hasMediaLibraryPermission && !isLoadingPermissions && !capturedImage) {
      pickImage();
    }
  }, [pickOnly, hasMediaLibraryPermission, isLoadingPermissions, capturedImage]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });
        setCapturedImage(data.uri);
      } catch (error) {
        console.log('Error taking picture:', error);
        Alert.alert('Error', 'Could not take picture.');
      }
    }
  };

  const pickImage = async () => {
    if (!hasMediaLibraryPermission) {
      Alert.alert('Permission Denied', 'Sorry, we need media library permissions to make this work!');
      if (pickOnly) navigation.goBack();
      return;
    }
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
      } else if (pickOnly && result.canceled) {
        navigation.goBack();
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Could not pick image from library.');
      if (pickOnly) navigation.goBack();
    }
  };

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const toggleFlashMode = () => {
    setFlash(current => {
      if (current === FlashMode.off) return FlashMode.on;
      if (current === FlashMode.on) return FlashMode.auto;
      return FlashMode.off;
    });
  };

  const getFlashIconName = () => {
    if (flash === FlashMode.on) return 'flash';
    if (flash === FlashMode.auto) return 'flash-outline';
    return 'flash-off';
  };

  const handleUseImage = () => {
    if (capturedImage) {
      if (source === 'CreatePost') {
        navigation.navigate({ name: 'CreatePost', params: { imageUri: capturedImage }, merge: true });
      } else if (source === 'Chat' && chatId) {
        navigation.navigate({ name: 'GroupChat', params: { imageUri: capturedImage, targetChatId: chatId }, merge: true });
      } else if (source === 'EditProfile') {
        navigation.navigate({ name: 'EditProfile', params: { imageUri: capturedImage }, merge: true });
      } else {
        Alert.alert('Image Selected', 'No specific destination for this image.');
        navigation.goBack();
      }
      setCapturedImage(null);
    }
  };

  if (isLoadingPermissions) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Requesting permissions...</Text>
      </SafeAreaView>
    );
  }

  if (!hasCameraPermission && !pickOnly) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text>No access to camera. Please enable it in settings.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.simpleButton}>
          <Text style={styles.simpleButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (pickOnly && !hasMediaLibraryPermission && !capturedImage) {
     return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text>No access to media library. Please enable it in settings.</Text>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.simpleButton}>
          <Text style={styles.simpleButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  if (pickOnly && !capturedImage && hasMediaLibraryPermission) {
     return (
      <SafeAreaView style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Opening image library...</Text>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.previewContainer}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          <TouchableOpacity onPress={() => {
            setCapturedImage(null);
            if (pickOnly) pickImage();
          }} style={styles.previewButton}>
            <Icon name="close-circle-outline" size={30} color={colors.white} />
            <Text style={styles.previewButtonText}>{pickOnly ? "Reselect" : "Retake"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUseImage} style={styles.previewButton}>
            <Icon name="checkmark-circle-outline" size={30} color={colors.white} />
            <Text style={styles.previewButtonText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  if (pickOnly) return null; 

  return (
    <SafeAreaView style={styles.container}>
       <Camera style={styles.camera} type={type} flashMode={flash} ref={cameraRef} ratio="16:9">
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={() => navigation.goBack()}>
            <Icon name="close-outline" size={30} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlashMode}>
            <Icon name={getFlashIconName()} size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Camera>
      <View style={styles.bottomContainer}>
        <View style={styles.modeSelector}>
            <Text style={[styles.modeText, styles.activeModeText]}>NORMAL</Text>
        </View>
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
            <Icon name="images-outline" size={30} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButtonOuter} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
            <Icon name="camera-reverse-outline" size={30} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  simpleButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  simpleButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? spacing.lg : spacing.xxl, // Adjusted for Android status bar
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
   bottomContainer: {
    height: 160, 
    backgroundColor: colors.white, 
    justifyContent: 'space-around',
    paddingBottom: spacing.md,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  modeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    marginHorizontal: spacing.md,
  },
  activeModeText: {
    color: colors.primary, 
    fontWeight: 'bold',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    padding: spacing.sm,
  },
  captureButtonOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.text, 
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white, 
    borderWidth: 2,
    borderColor: colors.black, 
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width,
    height: width * (16/9), 
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
  previewButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  previewButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
});

export default CameraScreen;