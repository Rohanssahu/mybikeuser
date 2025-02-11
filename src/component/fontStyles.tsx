import { TextStyle } from 'react-native';

const FontFamily = {
  Regular: 'System', // Change this to a custom font if needed (e.g., 'Poppins-Regular')
  Bold: 'System',
  SemiBold: 'System',
  Light: 'System',
};

const FontSize = {
  Small: 12,
  Medium: 16,
  Large: 20,
  ExtraLarge: 24,
};

const FontWeight: { [key: string]: TextStyle['fontWeight'] } = {
  Thin: '100',
  Light: '300',
  Regular: '400',
  Medium: '500',
  SemiBold: '600',
  Bold: '700',
  ExtraBold: '800',
};

const FontStyles = {
  smallText: {
    fontSize: FontSize.Small,
    fontFamily: FontFamily.Regular,
    fontWeight: FontWeight.Regular,
  } as TextStyle,
  mediumText: {
    fontSize: FontSize.Medium,
    fontFamily: FontFamily.Regular,
    fontWeight: FontWeight.Medium,
  } as TextStyle,
  largeText: {
    fontSize: FontSize.Large,
    fontFamily: FontFamily.Bold,
    fontWeight: FontWeight.Bold,
  } as TextStyle,
  extraLargeText: {
    fontSize: FontSize.ExtraLarge,
    fontFamily: FontFamily.Bold,
    fontWeight: FontWeight.ExtraBold,
  } as TextStyle,
};

export { FontStyles, FontSize, FontWeight, FontFamily };
