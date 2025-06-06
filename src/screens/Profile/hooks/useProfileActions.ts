import { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import * as ImagePicker from 'expo-image-picker';
import { UserService } from '../../../services/userService';
import { RegionService } from '../../../services/regionService';
import { User } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import { updateProfile } from 'firebase/auth';
import { Alert } from 'react-native';
import { ProfileCacheService } from '../../../services/profileCacheService';
import { useAuth } from '../../../context/AuthContext';

export const useProfileActions = (user: User | null) => {
  const { cachedProfile } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(
    cachedProfile?.displayName || user?.displayName || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState(
    cachedProfile?.photoURL || user?.photoURL || ''
  );
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        if (cachedProfile && cachedProfile.uid === user.uid) {
          setDisplayName(cachedProfile.displayName || '');
          setPhotoURL(cachedProfile.photoURL || '');
          setOriginalDisplayName(cachedProfile.displayName || '');
        }

        const userData = await UserService.getUserData(user.uid);
        if (userData) {
          setDisplayName(userData.displayName || user.displayName || '');
          setPhotoURL(userData.photoURL || user.photoURL || '');
          setOriginalDisplayName(
            userData.displayName || user.displayName || ''
          );

          await ProfileCacheService.saveProfileCache({
            uid: user.uid,
            displayName: userData.displayName || user.displayName || '',
            email: user.email || '',
            photoURL: userData.photoURL || user.photoURL || '',
          });
        }
      } catch (error) {
        console.error('Lỗi khi load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user?.uid, cachedProfile]);

  const handleStartEditing = () => {
    setOriginalDisplayName(displayName);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setDisplayName(originalDisplayName);
    setIsEditing(false);
  };

  const handleImportData = async () => {
    Alert.alert(
      'Cảnh báo Reset Database',
      'Hành động này sẽ xóa toàn bộ dữ liệu recipes và hình ảnh hiện tại, sau đó import lại từ đầu. Bạn có chắc chắn muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tiếp tục',
          style: 'destructive',
          onPress: showSecondConfirmation,
        },
      ]
    );
  };

  const showSecondConfirmation = () => {
    Alert.alert(
      'Xác nhận lần cuối',
      'Đây là thao tác không thể hoàn tác. Tất cả dữ liệu recipes và hình ảnh sẽ bị reset. Bạn thực sự muốn tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset & Import',
          style: 'destructive',
          onPress: importData,
        },
      ]
    );
  };

  const importData = async () => {
    setIsImporting(true);
    try {
      const success = await RegionService.importDataToFirestore();
      if (success) {
        showToast('success', 'Đã import dữ liệu vào Firestore');
      } else {
        showToast('error', 'Không thể import dữ liệu');
      }
    } catch (error) {
      showToast('error', 'Có lỗi xảy ra khi import dữ liệu');
    } finally {
      setIsImporting(false);
    }
  };

  const pickImage = async () => {
    if (!user) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsUploading(true);
        try {
          const downloadURL = await UserService.uploadAvatar(
            user.uid,
            result.assets[0].uri
          );
          if (downloadURL) {
            if (user.photoURL) {
              await UserService.deleteOldAvatar(user.photoURL);
            }
            await updateProfile(auth.currentUser!, {
              photoURL: downloadURL,
            });
            setPhotoURL(downloadURL);
            if (auth.currentUser) {
              auth.currentUser.reload();
            }
            showToast('success', 'Đã cập nhật ảnh đại diện');
          }
        } catch (error) {
          console.error('Lỗi khi upload:', error);
          showToast('error', 'Không thể cập nhật ảnh đại diện');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      showToast('error', 'Không thể chọn ảnh');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const success = await UserService.updateProfile(user.uid, {
        displayName,
      });
      if (success) {
        await ProfileCacheService.saveProfileCache({
          uid: user.uid,
          displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
        showToast('success', 'Đã cập nhật thông tin');
        setIsEditing(false);
      }
    } catch (error) {
      showToast('error', 'Không thể cập nhật thông tin');
    }
  };

  const handleCreateUserDocument = async () => {
    if (!user) return;
    try {
      const success = await UserService.createUserDocument(
        user.uid,
        user.email || ''
      );
      if (success) {
        showToast('success', 'Đã tạo thông tin người dùng');
      }
    } catch (error) {
      showToast('error', 'Không thể tạo thông tin người dùng');
    }
  };

  return {
    displayName,
    setDisplayName,
    isEditing,
    setIsEditing,
    handleStartEditing,
    handleCancelEditing,
    handleImportData,
    pickImage,
    handleSaveProfile,
    handleCreateUserDocument,
    isUploading,
    photoURL,
    isImporting,
    isLoading,
  };
};
