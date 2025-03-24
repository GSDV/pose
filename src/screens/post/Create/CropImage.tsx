import { COLORS } from '@util/global-client';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';

interface ImageCropperProps {
  imageUri: string;
  onCropComplete: (croppedImageUri: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Minimum dimensions for the crop frame
const MIN_CROP_WIDTH = 150;
const MIN_CROP_HEIGHT = 150;
const MIN_CROP_SIZE = 200;
const MIN_ASPECT_RATIO = 1 / 2; // 0.5
const MAX_ASPECT_RATIO = 2 / 1; // 2.0

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUri,
  onCropComplete,
  onCancel,
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [currentAspectRatio, setCurrentAspectRatio] = useState(1);
  
  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height * 0.7; // Use 70% of screen height
  
  // Load image dimensions
  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setImageSize({ width, height });
        
        // Calculate scaled image dimensions to fit screen
        const scale = Math.min(screenWidth / width, screenHeight / height);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        
        // Initial crop area at center with default 1:1 aspect ratio
        // Ensure it meets minimum width and height requirements
        const initialSize = Math.max(
          Math.min(scaledWidth, scaledHeight) * 0.8,
          Math.max(MIN_CROP_WIDTH, MIN_CROP_HEIGHT)
        );
        const initialCrop = {
          x: (scaledWidth - initialSize) / 2,
          y: (scaledHeight - initialSize) / 2,
          width: initialSize,
          height: initialSize,
        };
        
        setImageLayout({ width: scaledWidth, height: scaledHeight, x: 0, y: 0 });
        setCropArea(initialCrop);
        setCurrentAspectRatio(1);
      });
    }
  }, [imageUri]);
  
  // Handle crop completion - in a real app, you would use a library like expo-image-manipulator
  const handleCrop = async () => {
    try {
      // This is a simplified example. In a real application, you would use:
      // import * as ImageManipulator from 'expo-image-manipulator';
      // 
      // const manipResult = await ImageManipulator.manipulateAsync(
      //   imageUri,
      //   [
      //     {
      //       crop: {
      //         originX: cropArea.x * (imageSize.width / imageLayout.width),
      //         originY: cropArea.y * (imageSize.height / imageLayout.height),
      //         width: cropArea.width * (imageSize.width / imageLayout.width),
      //         height: cropArea.height * (imageSize.height / imageLayout.height),
      //       },
      //     },
      //   ],
      //   { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      // );
      // 
      // onCropComplete(manipResult.uri);
      
      // For this example, we'll just return the original URI
      Alert.alert(
        "Crop Information",
        `Crop completed with aspect ratio: ${currentAspectRatio.toFixed(2)}\n
        Crop dimensions: ${Math.round(cropArea.width)}×${Math.round(cropArea.height)} px\n
        In a real app, this would crop the image at:
        x: ${Math.round(cropArea.x * (imageSize.width / imageLayout.width))}
        y: ${Math.round(cropArea.y * (imageSize.height / imageLayout.height))}
        width: ${Math.round(cropArea.width * (imageSize.width / imageLayout.width))}
        height: ${Math.round(cropArea.height * (imageSize.height / imageLayout.height))}`
      );
      
      onCropComplete(imageUri);
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert('Error', 'Failed to crop image');
    }
  };

  // PanResponder for moving the entire crop box
  const movePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Store initial crop area when starting to drag
    },
    onPanResponderMove: (_, gestureState) => {
      const { dx, dy } = gestureState;
      setCropArea(prev => {
        // Calculate new position
        let newX = prev.x + dx;
        let newY = prev.y + dy;
        
        // Keep within image bounds
        newX = Math.max(0, Math.min(imageLayout.width - prev.width, newX));
        newY = Math.max(0, Math.min(imageLayout.height - prev.height, newY));
        
        return {
          ...prev,
          x: newX,
          y: newY,
        };
      });
    },
    onPanResponderRelease: () => {
      // Reset gesture state
    },
  });

  // Create PanResponders for each corner and edge
  const createEdgePanResponder = (edge: string) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store initial values when starting to resize
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        
        setCropArea(prev => {
          let newX = prev.x;
          let newY = prev.y;
          let newWidth = prev.width;
          let newHeight = prev.height;
          
          // Handle resize based on which edge is being dragged
          // For corners, we need to handle both dimensions simultaneously
          if (edge === 'topLeft') {
            newX = prev.x + dx;
            newY = prev.y + dy;
            newWidth = prev.width - dx;
            newHeight = prev.height - dy;
          } else if (edge === 'topRight') {
            newY = prev.y + dy;
            newWidth = prev.width + dx;
            newHeight = prev.height - dy;
          } else if (edge === 'bottomLeft') {
            newX = prev.x + dx;
            newWidth = prev.width - dx;
            newHeight = prev.height + dy;
          } else if (edge === 'bottomRight') {
            newWidth = prev.width + dx;
            newHeight = prev.height + dy;
          } else if (edge === 'left') {
            newX = prev.x + dx;
            newWidth = prev.width - dx;
          } else if (edge === 'right') {
            newWidth = prev.width + dx;
          } else if (edge === 'top') {
            newY = prev.y + dy;
            newHeight = prev.height - dy;
          } else if (edge === 'bottom') {
            newHeight = prev.height + dy;
          }
          
          // Enforce minimum size
          if (newWidth < MIN_CROP_SIZE) {
            if (edge.includes('left')) {
              newX = prev.x + prev.width - MIN_CROP_SIZE;
            }
            newWidth = MIN_CROP_SIZE;
          }
          
          if (newHeight < MIN_CROP_SIZE) {
            if (edge.includes('top')) {
              newY = prev.y + prev.height - MIN_CROP_SIZE;
            }
            newHeight = MIN_CROP_SIZE;
          }
          
          // Keep within image bounds
          if (newX < 0) {
            newWidth += newX;
            newX = 0;
          }
          
          if (newY < 0) {
            newHeight += newY;
            newY = 0;
          }
          
          if (newX + newWidth > imageLayout.width) {
            newWidth = imageLayout.width - newX;
          }
          
          if (newY + newHeight > imageLayout.height) {
            newHeight = imageLayout.height - newY;
          }
          
          // Enforce aspect ratio limits
          const aspectRatio = newWidth / newHeight;
          
          if (aspectRatio < MIN_ASPECT_RATIO) {
            // Adjust width or height to maintain minimum aspect ratio
            if (edge.includes('left') || edge.includes('right')) {
              newWidth = newHeight * MIN_ASPECT_RATIO;
            } else {
              newHeight = newWidth / MIN_ASPECT_RATIO;
            }
          } else if (aspectRatio > MAX_ASPECT_RATIO) {
            // Adjust width or height to maintain maximum aspect ratio
            if (edge.includes('left') || edge.includes('right')) {
              newWidth = newHeight * MAX_ASPECT_RATIO;
            } else {
              newHeight = newWidth / MAX_ASPECT_RATIO;
            }
          }
          
          // Final boundary check
          if (newX + newWidth > imageLayout.width) {
            if (edge.includes('left')) {
              newX = imageLayout.width - newWidth;
            } else {
              newWidth = imageLayout.width - newX;
            }
          }
          
          if (newY + newHeight > imageLayout.height) {
            if (edge.includes('top')) {
              newY = imageLayout.height - newHeight;
            } else {
              newHeight = imageLayout.height - newY;
            }
          }
          
          return {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          };
        });
      },
      onPanResponderRelease: () => {
        // Calculate and update aspect ratio
        setCurrentAspectRatio(cropArea.width / cropArea.height);
        // Log crop area information for debugging
        logCropAreaInfo();
      },
    });
  };

  // Create PanResponders for each corner and edge
  const topLeftResponder = createEdgePanResponder('topLeft');
  const topResponder = createEdgePanResponder('top');
  const topRightResponder = createEdgePanResponder('topRight');
  const rightResponder = createEdgePanResponder('right');
  const bottomRightResponder = createEdgePanResponder('bottomRight');
  const bottomResponder = createEdgePanResponder('bottom');
  const bottomLeftResponder = createEdgePanResponder('bottomLeft');
  const leftResponder = createEdgePanResponder('left');
  
  // For debugging
  const logCropAreaInfo = () => {
    console.log(`Crop Area: x=${cropArea.x.toFixed(0)}, y=${cropArea.y.toFixed(0)}, width=${cropArea.width.toFixed(0)}, height=${cropArea.height.toFixed(0)}, ratio=${(cropArea.width/cropArea.height).toFixed(2)}`);
  };
  
  // Update aspect ratio when crop area changes
  useEffect(() => {
    setCurrentAspectRatio(cropArea.width / cropArea.height);
  }, [cropArea.width, cropArea.height]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crop Image</Text>
        <Text style={styles.aspectRatio}>
          Aspect Ratio: {currentAspectRatio.toFixed(2)} 
          (Min: {MIN_ASPECT_RATIO.toFixed(2)}, Max: {MAX_ASPECT_RATIO.toFixed(2)})
        </Text>
        <Text style={styles.aspectRatio}>
          Minimum dimensions: {MIN_CROP_WIDTH}×{MIN_CROP_HEIGHT} px
        </Text>
      </View>
      
      <View
        style={[styles.imageContainer, { width: screenWidth, height: screenHeight }]}
        onLayout={(event) => {
          const { x, y } = event.nativeEvent.layout;
          setImageLayout((prev) => ({ ...prev, x, y }));
        }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{
            width: imageLayout.width,
            height: imageLayout.height,
            resizeMode: 'contain',
          }}
        />
        
        <View style={[styles.overlay, { width: imageLayout.width, height: imageLayout.height }]}>
          {/* Cutout for the crop area */}
          <View
            style={[
              styles.cropArea,
              {
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
              },
            ]}
          >
            {/* Grid lines */}
            {/* <View style={[styles.gridLine, styles.horizontalTop]} />
            <View style={[styles.gridLine, styles.horizontalMiddle]} />
            <View style={[styles.gridLine, styles.horizontalBottom]} />
            <View style={[styles.gridLine, styles.verticalLeft]} />
            <View style={[styles.gridLine, styles.verticalMiddle]} />
            <View style={[styles.gridLine, styles.verticalRight]} /> */}
            
            {/* Move handle (center area) */}
            <View style={styles.moveHandle} {...movePanResponder.panHandlers} />
            
            {/* Corner and edge handles */}
            <View style={[styles.dragger, styles.topLeft]} {...topLeftResponder.panHandlers} />
            <View style={[styles.dragger, styles.top, styles.middleDragger]} {...topResponder.panHandlers} />
            <View style={[styles.dragger, styles.topRight]} {...topRightResponder.panHandlers} />
            <View style={[styles.dragger, styles.right, styles.middleDragger]} {...rightResponder.panHandlers} />
            <View style={[styles.dragger, styles.bottomRight]} {...bottomRightResponder.panHandlers} />
            <View style={[styles.dragger, styles.bottom, styles.middleDragger]} {...bottomResponder.panHandlers} />
            <View style={[styles.dragger, styles.bottomLeft]} {...bottomLeftResponder.panHandlers} />
            <View style={[styles.dragger, styles.left, styles.middleDragger]} {...leftResponder.panHandlers} />
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleCrop}>
          <Text style={[styles.buttonText, styles.primaryButtonText]}>Crop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  header: {
    padding: 15,
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  aspectRatio: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  imageContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cropArea: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  dragger: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  middleDragger: {
    width: 20,
    height: 20,
  },
  topLeft: {
    top: 0,
    left: 0,
    transform: [
        { translateX: '-50%' },
        { translateY: '-50%' }
    ],
  },
  topRight: {
    top: 0,
    right: 0,
    transform: [
        { translateX: '50%' },
        { translateY: '-50%' }
    ],
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    transform: [
        { translateX: '-50%' },
        { translateY: '50%' }
    ],
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    transform: [
        { translateX: '50%' },
        { translateY: '50%' }
    ],
  },
  top: {
    top: -10,
    left: '50%',
    marginLeft: -10,
  },
  right: {
    top: '50%',
    right: -10,
    marginTop: -10,
  },
  bottom: {
    bottom: -10,
    left: '50%',
    marginLeft: -10,
  },
  left: {
    top: '50%',
    left: -10,
    marginTop: -10,
  },
  moveHandle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  horizontalTop: {
    width: '100%',
    height: 1,
    top: '33.33%',
  },
  horizontalMiddle: {
    width: '100%',
    height: 1,
    top: '50%',
  },
  horizontalBottom: {
    width: '100%',
    height: 1,
    top: '66.66%',
  },
  verticalLeft: {
    width: 1,
    height: '100%',
    left: '33.33%',
  },
  verticalMiddle: {
    width: 1,
    height: '100%',
    left: '50%',
  },
  verticalRight: {
    width: 1,
    height: '100%',
    left: '66.66%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: COLORS.white,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: '#333',
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0080ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
});

export default ImageCropper;