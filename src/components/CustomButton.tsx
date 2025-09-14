import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';
import { CustomButtonProps } from '../types';

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        ...ANIMATIONS.springGentle,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.8,
        duration: ANIMATIONS.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATIONS.springGentle,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: ANIMATIONS.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: SIZES.radiusMd,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...SIZES.shadow,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = SIZES.spacingMd;
        baseStyle.paddingVertical = SIZES.spacingSm;
        baseStyle.minHeight = 36;
        break;
      case 'large':
        baseStyle.paddingHorizontal = SIZES.spacingXl;
        baseStyle.paddingVertical = SIZES.spacingLg;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingHorizontal = SIZES.spacingLg;
        baseStyle.paddingVertical = SIZES.spacingMd;
        baseStyle.minHeight = 48;
    }

    // Width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = SIZES.fontSizeSm;
        break;
      case 'large':
        baseStyle.fontSize = SIZES.fontSizeLg;
        break;
      default: // medium
        baseStyle.fontSize = SIZES.fontSizeMd;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.color = COLORS.textInverse;
        break;
      case 'secondary':
        baseStyle.color = COLORS.textInverse;
        break;
      case 'outline':
        baseStyle.color = COLORS.primary;
        break;
      case 'ghost':
        baseStyle.color = COLORS.primary;
        break;
      case 'danger':
        baseStyle.color = COLORS.textInverse;
        break;
    }

    return baseStyle;
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
      case 'success':
        return COLORS.textInverse;
      case 'outline':
      case 'ghost':
        return COLORS.primary;
      default:
        return COLORS.textInverse;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return SIZES.iconSm;
      case 'large':
        return SIZES.iconLg;
      default:
        return SIZES.iconMd;
    }
  };

  const renderButtonContent = () => {
    const iconSize = getIconSize();
    const iconColor = getIconColor();

    return (
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={getIconColor()} 
            style={styles.loader}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons 
                name={icon} 
                size={iconSize} 
                color={iconColor} 
                style={styles.iconLeft}
              />
            )}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <Ionicons 
                name={icon} 
                size={iconSize} 
                color={iconColor} 
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </View>
    );
  };

  const renderButton = () => {
    const buttonStyle = getButtonStyle();

    if (variant === 'primary' || variant === 'secondary' || variant === 'danger' || variant === 'success') {
      const gradientColors = 
        variant === 'primary' ? COLORS.primaryGradient :
        variant === 'secondary' ? COLORS.secondaryGradient :
        variant === 'success' ? COLORS.successGradient :
        COLORS.errorGradient;

      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonStyle, style]}
        >
          {renderButtonContent()}
        </LinearGradient>
      );
    }

    // For outline and ghost variants
    const backgroundColor = 
      variant === 'outline' ? 'transparent' :
      variant === 'ghost' ? COLORS.primaryLight : 'transparent';

    const borderWidth = variant === 'outline' ? 2 : 0;
    const borderColor = variant === 'outline' ? COLORS.primary : 'transparent';

    return (
      <View style={[
        buttonStyle,
        { backgroundColor, borderWidth, borderColor },
        style
      ]}>
        {renderButtonContent()}
      </View>
    );
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        opacity: opacityValue,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {renderButton()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: SIZES.radiusMd,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: SIZES.spacingSm,
  },
  iconRight: {
    marginLeft: SIZES.spacingSm,
  },
  loader: {
    marginRight: SIZES.spacingSm,
  },
});

export default CustomButton;
