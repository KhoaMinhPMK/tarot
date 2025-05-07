import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#6A11CB',  // Deep purple as primary color
  secondary: '#2575FC', // Blue as secondary color
  accent: '#FF6B6B',   // Soft red as accent
  background: '#F8F9FA', // Light gray background
  white: '#FFFFFF',
  black: '#000000',
  gray: '#AAAAAA',
  lightGray: '#EEEEEE',
  lightGray2: '#F5F5F5', // Slightly darker light gray
  darkGray: '#555555',
  success: '#4CAF50',
  danger: '#F44336',
  transparent: 'transparent',
};

export const SIZES = {
  // Global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  // Font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 18,
  h4: 16,
  h5: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // App dimensions
  width,
  height
};

export const FONTS = {
  largeTitle: { fontFamily: 'System', fontSize: SIZES.largeTitle, lineHeight: 55 },
  h1: { fontFamily: 'System', fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: 'System', fontSize: SIZES.h2, lineHeight: 30 },
  h3: { fontFamily: 'System', fontSize: SIZES.h3, lineHeight: 22 },
  h4: { fontFamily: 'System', fontSize: SIZES.h4, lineHeight: 20 },
  h5: { fontFamily: 'System', fontSize: SIZES.h5, lineHeight: 18 },
  body1: { fontFamily: 'System', fontSize: SIZES.body1, lineHeight: 36 },
  body2: { fontFamily: 'System', fontSize: SIZES.body2, lineHeight: 30 },
  body3: { fontFamily: 'System', fontSize: SIZES.body3, lineHeight: 22 },
  body4: { fontFamily: 'System', fontSize: SIZES.body4, lineHeight: 20 },
  body5: { fontFamily: 'System', fontSize: SIZES.body5, lineHeight: 18 },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    marginVertical: 10,
    height: 55,
    width: '100%',
    borderColor: COLORS.lightGray,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    paddingHorizontal: SIZES.padding,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginVertical: 8,
    borderColor: COLORS.lightGray,
    borderWidth: 1,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.darkGray,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    color: COLORS.gray,
    paddingHorizontal: 10,
    fontSize: 14,
  }
});

export default globalStyles;