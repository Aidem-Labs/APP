import { LMN8BorderRadius, LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import React, { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

export interface LMN8InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
}

export const LMN8Input: React.FC<LMN8InputProps> = ({
  label,
  placeholder,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        leftIcon ? styles.inputContainerWithLeftIcon : null,
        rightIcon ? styles.inputContainerWithRightIcon : null,
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            textInputProps.multiline ? styles.inputMultiline : styles.inputSingleLine,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={LMN8Colors.text60}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error ? styles.errorText : styles.helperTextNormal,
          error ? errorStyle : helperStyle,
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: LMN8Spacing.md,
  },
  
  label: {
    ...LMN8Typography.label,
    marginBottom: LMN8Spacing.sm,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LMN8Colors.bgLight,
    borderWidth: 2,
    borderColor: LMN8Colors.uiSecondary,
    borderRadius: LMN8BorderRadius.md,
    minHeight: 48,
    paddingHorizontal: LMN8Spacing.md,
  },
  
  inputContainerFocused: {
    borderColor: LMN8Colors.accentHighlight,
    shadowColor: LMN8Colors.accentHighlight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  inputContainerError: {
    borderColor: LMN8Colors.error,
  },
  
  inputContainerWithLeftIcon: {
    paddingLeft: LMN8Spacing.sm,
  },
  
  inputContainerWithRightIcon: {
    paddingRight: LMN8Spacing.sm,
  },
  
  leftIcon: {
    marginRight: LMN8Spacing.sm,
  },
  
  rightIcon: {
    marginLeft: LMN8Spacing.sm,
  },
  
  input: {
    ...LMN8Typography.body,
    flex: 1,
    color: LMN8Colors.text100,
    paddingVertical: 0,
  },

  inputSingleLine: {
    minHeight: 24,
    lineHeight: 22,
    textAlignVertical: 'center',
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
  },

  inputMultiline: {
    textAlignVertical: 'top',
    paddingVertical: LMN8Spacing.md,
  },
  
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  
  inputWithRightIcon: {
    paddingRight: 0,
  },
  
  helperText: {
    marginTop: LMN8Spacing.sm,
    paddingHorizontal: LMN8Spacing.sm,
  },
  
  helperTextNormal: {
    ...LMN8Typography.metadata,
    color: LMN8Colors.text60,
  },
  
  errorText: {
    ...LMN8Typography.metadata,
    color: LMN8Colors.error,
  },
});
