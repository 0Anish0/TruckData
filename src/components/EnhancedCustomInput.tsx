import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, ANIMATIONS } from '../constants/theme';

interface EnhancedCustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

const EnhancedCustomInput: React.FC<EnhancedCustomInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'default',
  size = 'medium',
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(!!value);
  
  const labelAnim = useRef(new Animated.Value(isFilled ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const hasValue = !!value && value.toString().length > 0;
    setIsFilled(hasValue);
    
    Animated.timing(labelAnim, {
      toValue: hasValue || isFocused ? 1 : 0,
      duration: ANIMATIONS.fast,
      useNativeDriver: false,
    }).start();
  }, [value, isFocused]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: ANIMATIONS.fast,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        ...ANIMATIONS.springGentle,
      }),
    ]).start();
    
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    
    Animated.parallel([
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: ANIMATIONS.fast,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...ANIMATIONS.springGentle,
      }),
    ]).start();
    
    if (onBlur) onBlur(e);
  };

  const getContainerStyle = () => {
    const baseStyle = {
      borderRadius: SIZES.radiusMd,
      borderWidth: 1,
      borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.border,
      backgroundColor: COLORS.surface,
      ...SIZES.shadowSubtle,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = SIZES.spacingMd;
        baseStyle.paddingVertical = SIZES.spacingSm;
        baseStyle.minHeight = 40;
        break;
      case 'large':
        baseStyle.paddingHorizontal = SIZES.spacingLg;
        baseStyle.paddingVertical = SIZES.spacingLg;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingHorizontal = SIZES.spacingLg;
        baseStyle.paddingVertical = SIZES.spacingMd;
        baseStyle.minHeight = 48;
    }

    // Variant styles
    switch (variant) {
      case 'outlined':
        baseStyle.borderWidth = 2;
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'filled':
        baseStyle.backgroundColor = COLORS.backgroundSecondary;
        baseStyle.borderWidth = 0;
        break;
    }

    return baseStyle;
  };

  const getInputStyle = () => {
    const baseStyle = {
      flex: 1,
      fontSize: SIZES.fontSizeMd,
      color: COLORS.textPrimary,
      fontWeight: '500',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = SIZES.fontSizeSm;
        break;
      case 'large':
        baseStyle.fontSize = SIZES.fontSizeLg;
        break;
    }

    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle = {
      fontSize: SIZES.fontSizeSm,
      fontWeight: '600',
      marginBottom: SIZES.spacingXs,
    };

    if (error) {
      baseStyle.color = COLORS.error;
    } else if (isFocused) {
      baseStyle.color = COLORS.primary;
    } else {
      baseStyle.color = COLORS.textSecondary;
    }

    return baseStyle;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return SIZES.iconSm;
      case 'large':
        return SIZES.iconLg;
      default:
        return SIZES.iconMd;
    }
  };

  const animatedLabelStyle = {
    position: 'absolute' as const,
    left: leftIcon ? SIZES.spacingXl + SIZES.spacingMd : SIZES.spacingLg,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [size === 'large' ? 18 : size === 'small' ? 12 : 16, -8],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [SIZES.fontSizeMd, SIZES.fontSizeSm],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.textTertiary, error ? COLORS.error : COLORS.primary],
    }),
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.spacingXs,
    zIndex: 1,
  };

  const animatedBorderStyle = {
    borderColor: borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [error ? COLORS.error : COLORS.border, error ? COLORS.error : COLORS.primary],
    }),
  };

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {label && (
        <Animated.Text style={[getLabelStyle(), labelStyle, animatedLabelStyle]}>
          {label}
        </Animated.Text>
      )}
      
      <Animated.View
        style={[
          getContainerStyle(),
          animatedBorderStyle,
        ]}
      >
        <View style={styles.inputContainer}>
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              <Ionicons
                name={leftIcon}
                size={getIconSize()}
                color={isFocused ? COLORS.primary : COLORS.textTertiary}
              />
            </View>
          )}
          
          <TextInput
            style={[getInputStyle(), inputStyle]}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={COLORS.textTertiary}
            {...props}
          />
          
          {rightIcon && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={onRightIconPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={rightIcon}
                size={getIconSize()}
                color={isFocused ? COLORS.primary : COLORS.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={[styles.errorText, errorStyle]}>{error}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.spacingLg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIconContainer: {
    marginRight: SIZES.spacingSm,
  },
  rightIconContainer: {
    marginLeft: SIZES.spacingSm,
    padding: SIZES.spacingXs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.spacingXs,
    paddingHorizontal: SIZES.spacingXs,
  },
  errorText: {
    fontSize: SIZES.fontSizeSm,
    color: COLORS.error,
    marginLeft: SIZES.spacingXs,
    fontWeight: '500',
  },
});

export default EnhancedCustomInput;
