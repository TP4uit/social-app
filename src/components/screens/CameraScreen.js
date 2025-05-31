import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, SafeAreaView, Alert } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../theme';

const { width } = Dimensions.get('window');

const CameraScreen = ({ navigation }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [flash, setFlash] = useState(FlashMode.off);
  const [capturedImage, setCapturedImage] = useState(null); // Để lưu ảnh đã chụp/chọn

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const data = await cameraRef.current.takePictureAsync({
          quality: 0.7, // Giảm chất lượng để ảnh nhẹ hơn
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
        return;
    }
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Chỉ chọn ảnh
        allowsEditing: true, // Cho phép chỉnh sửa cơ bản
        aspect: [4, 3], // Tỷ lệ khung hình (tùy chọn)
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Could not pick image from library.');
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
    if (flash === FlashMode.auto) return 'flash-outline'; // Icon cho auto, hoặc có thể dùng 'flash-auto-outline' nếu có
    return 'flash-off';
  };

  const handleUseImage = () => {
    if (capturedImage) {
      // Điều hướng đến CreatePostScreen và truyền URI ảnh
      navigation.navigate('CreatePost', { imageUri: capturedImage });
      setCapturedImage(null); // Reset lại để có thể chụp/chọn ảnh mới
    }
  };


  if (hasCameraPermission === null) {
    return <View style={styles.permissionContainer}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasCameraPermission === false) {
    return <View style={styles.permissionContainer}><Text>No access to camera. Please enable it in settings.</Text></View>;
  }

  // Nếu có ảnh đã chụp/chọn, hiển thị màn hình preview
  if (capturedImage) {
    return (
      <SafeAreaView style={styles.previewContainer}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          <TouchableOpacity onPress={() => setCapturedImage(null)} style={styles.previewButton}>
            <Icon name="close-circle-outline" size={30} color={colors.white} />
            <Text style={styles.previewButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUseImage} style={styles.previewButton}>
            <Icon name="checkmark-circle-outline" size={30} color={colors.white} />
            <Text style={styles.previewButtonText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Giao diện camera chính
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
        {/* Thanh chế độ chụp (TYPE, LIVE, NORMAL, BOOMERANG, SUPERZOOM) */}
        {/* Hiện tại chúng ta sẽ giữ thanh này đơn giản, chỉ hiển thị "NORMAL" */}
        <View style={styles.modeSelector}>
            <Text style={[styles.modeText, styles.activeModeText]}>NORMAL</Text>
            {/* Bạn có thể thêm các Text khác ở đây cho các chế độ khác và style chúng */}
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
  },
  camera: {
    flex: 1, // Để camera chiếm phần lớn không gian
    // aspectRatio: 9 / 16, // Đảm bảo tỷ lệ khung hình
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg, // Hoặc Platform.OS === 'ios' ? 44 : spacing.md, nếu dùng SafeAreaView
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
   bottomContainer: {
    height: 160, // Chiều cao cho khu vực điều khiển dưới cùng
    backgroundColor: colors.white, // Nền trắng cho khu vực này
    justifyContent: 'space-around',
    paddingBottom: spacing.md,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    // borderBottomWidth: 1, // Nếu muốn có đường kẻ phân cách
    // borderBottomColor: colors.border,
  },
  modeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    marginHorizontal: spacing.md,
  },
  activeModeText: {
    color: colors.primary, // Hoặc màu đen
    fontWeight: 'bold',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    // paddingVertical: spacing.lg, // Đã có padding ở bottomContainer
  },
  controlButton: {
    padding: spacing.sm,
  },
  captureButtonOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent', // Không có màu nền bên ngoài
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.text, // Viền ngoài màu đen hoặc xám đậm
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white, // Nút chụp màu trắng bên trong
    borderWidth: 2,
    borderColor: colors.black, // Viền nhỏ màu đen cho nút trắng
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width,
    height: width * (16/9), // Giả sử tỷ lệ 16:9, bạn có thể điều chỉnh
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