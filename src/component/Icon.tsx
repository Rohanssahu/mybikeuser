import React from 'react';
import { Image, ImageSourcePropType, ImageStyle } from 'react-native';

interface CustomIconProps {
  source: ImageSourcePropType; // Can be a local or remote image
  size?: number; // Optional: Set width & height
  tintColor?: string; // Optional: Change image color
  style?: ImageStyle; // Optional: Custom styles
}

const Icon: React.FC<CustomIconProps> = ({ source, size = 30, tintColor, style }) => {
  return (
    <Image
      source={source}
      style={[
        { width: size, height: size, tintColor },
        style, // Allow additional styles
      ]}
      resizeMode="contain"
    />
  );
};

export default Icon;
