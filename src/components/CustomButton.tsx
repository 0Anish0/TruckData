import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const buttonStyle: ViewStyle[] = [styles.button];
    
    // Add size styles
    if (size === 'small') buttonStyle.push(styles.small);
    if (size === 'medium') buttonStyle.push(styles.medium);
    if (size === 'large') buttonStyle.push(styles.large);
    
    // Add variant styles
    if (variant === 'primary') buttonStyle.push(styles.primary);
    if (variant === 'secondary') buttonStyle.push(styles.secondary);
    if (variant === 'outline') buttonStyle.push(styles.outline);
    
    // Add disabled style
    if (disabled) buttonStyle.push(styles.disabled);
    
    return buttonStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const textStyle: TextStyle[] = [styles.text];
    
    // Add size styles
    if (size === 'small') textStyle.push(styles.smallText);
    if (size === 'medium') textStyle.push(styles.mediumText);
    if (size === 'large') textStyle.push(styles.largeText);
    
    // Add variant styles
    if (variant === 'outline') textStyle.push(styles.outlineText);
    if (disabled) textStyle.push(styles.disabledText);
    
    return textStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? COLORS.primary : COLORS.surface} 
          size="small" 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SIZES.shadow,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabled: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border,
  },
  small: {
    paddingVertical: SIZES.spacingSm,
    paddingHorizontal: SIZES.spacingLg,
    minHeight: 40,
  },
  medium: {
    paddingVertical: SIZES.spacingMd,
    paddingHorizontal: SIZES.spacingXl,
    minHeight: 52,
  },
  large: {
    paddingVertical: SIZES.spacingMd,
    paddingHorizontal: SIZES.spacingXl,
    minHeight: 48,
  },
  text: {
    fontFamily: FONTS.medium,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: SIZES.fontSizeSm,
  },
  mediumText: {
    fontSize: SIZES.fontSizeMd,
  },
  largeText: {
    fontSize: SIZES.fontSizeLg,
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.textTertiary,
  },
});

export default CustomButton;
