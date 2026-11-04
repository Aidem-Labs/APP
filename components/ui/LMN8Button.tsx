import { LMN8BorderRadius, LMN8Colors, LMN8Spacing, LMN8TouchTargets } from '@/constants/LMN8DesignSystem';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

export interface LMN8ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const LMN8Button: React.FC<LMN8ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyleArray = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#ffffff' : LMN8Colors.accentPrimary}
          size="small" 
        />
      ) : (
        <Text style={textStyleArray}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LMN8BorderRadius.md,
    minHeight: LMN8TouchTargets.minSize,
    paddingHorizontal: LMN8Spacing.lg,
  },
  
  // Variants
  primary: {
    backgroundColor: LMN8Colors.cta,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: LMN8Colors.accentPrimary,
  },
  
  // Sizes
  small: {
    paddingVertical: LMN8Spacing.sm,
    paddingHorizontal: LMN8Spacing.md,
    minHeight: 36,
  },
  medium: {
    paddingVertical: LMN8Spacing.md,
    paddingHorizontal: LMN8Spacing.lg,
    minHeight: 44,
  },
  large: {
    paddingVertical: LMN8Spacing.lg,
    paddingHorizontal: LMN8Spacing.xl,
    minHeight: 52,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontFamily: 'System',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: LMN8Colors.accentPrimary,
  },
  
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  disabledText: {
    color: LMN8Colors.text60,
  },
});
