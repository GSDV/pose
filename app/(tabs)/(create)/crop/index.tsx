import React, { useState } from 'react';

import { View, Button, Image, StyleSheet, Text } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';

import ImageCropper from '@screens/post/Create/CropImage';



export default function Index() {
    const pictureUri = useLocalSearchParams().pictureUri as string;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Pick an image from the gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setCroppedImage(null);
      setIsCropping(true);
    }
  };

  // Handle crop completion
  const handleCropComplete = (croppedImageUri: string) => {
    setCroppedImage(croppedImageUri);
    setIsCropping(false);
  };

  // Cancel cropping
  const handleCancelCrop = () => {
    setIsCropping(false);
  };

  return (
    <View style={styles.container}>
      {isCropping && selectedImage ? (
        <ImageCropper
          imageUri={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
        />
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Image Cropper Example</Text>
          
          {croppedImage ? (
            <View style={styles.imageContainer}>
              <Text style={styles.label}>Cropped Image:</Text>
              <Image source={{ uri: croppedImage }} style={styles.image} />
            </View>
          ) : selectedImage ? (
            <View style={styles.imageContainer}>
              <Text style={styles.label}>Selected Image:</Text>
              <Image source={{ uri: selectedImage }} style={styles.image} />
              <Button title="Crop This Image" onPress={() => setIsCropping(true)} />
            </View>
          ) : (
            <Text style={styles.instructions}>
              Select an image to start cropping. The cropper enforces aspect ratios between 1:2 and 2:1.
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <Button title="Pick an Image" onPress={pickImage} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    marginTop: 20,
  },
});