import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LMN8Colors, LMN8Typography, LMN8Spacing, LMN8BorderRadius } from '@/constants/LMN8DesignSystem';
import { LMN8Button } from '@/components/ui/LMN8Button';
import { LMN8Input } from '@/components/ui/LMN8Input';

export interface LoginScreenProps {
  onLogin: (data: LoginData) => Promise<void>;
  onNavigateToSignup: () => void;
  onForgotPassword?: () => void;
}

export interface LoginData {
  email: string;
  password: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onNavigateToSignup,
  onForgotPassword,
}) => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onLogin(formData);
    } catch (error) {
      Alert.alert('Login Error', 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>METAT8</Text>
          <Text style={styles.tagline}>Welcome back to your sacred space</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Continue your therapeutic journey with METAT8 KTC
          </Text>

          <LMN8Input
            label="Email Address"
            placeholder="Enter your email address"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
          />

          <LMN8Input
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            error={errors.password}
            secureTextEntry
            autoComplete="password"
          />

          {onForgotPassword && (
            <View style={styles.forgotPasswordContainer}>
              <LMN8Button
                title="Forgot Password?"
                onPress={onForgotPassword}
                variant="secondary"
                size="small"
              />
            </View>
          )}

          <LMN8Button
            title="Sign In"
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            size="large"
            style={styles.submitButton}
          />

          <View style={styles.signupPrompt}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <LMN8Button
              title="Create Account"
              onPress={onNavigateToSignup}
              variant="secondary"
              size="small"
            />
          </View>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Your Journey Awaits</Text>
          <Text style={styles.welcomeText}>
            METAT8 KTC provides a safe, private space for your therapeutic growth. 
            All your data is stored locally and encrypted for complete privacy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LMN8Colors.bgDark,
  },
  
  scrollContent: {
    flexGrow: 1,
    padding: LMN8Spacing.lg,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: LMN8Spacing.xxl,
    marginTop: LMN8Spacing.xl,
  },
  
  logo: {
    ...LMN8Typography.h1,
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.sm,
  },
  
  tagline: {
    ...LMN8Typography.body,
    textAlign: 'center',
    color: LMN8Colors.text85,
  },
  
  formContainer: {
    backgroundColor: LMN8Colors.container,
    borderRadius: LMN8BorderRadius.xl,
    padding: LMN8Spacing.xl,
    marginBottom: LMN8Spacing.lg,
  },
  
  title: {
    ...LMN8Typography.h2,
    textAlign: 'center',
    marginBottom: LMN8Spacing.sm,
  },
  
  subtitle: {
    ...LMN8Typography.body,
    textAlign: 'center',
    color: LMN8Colors.text60,
    marginBottom: LMN8Spacing.xl,
  },
  
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: LMN8Spacing.lg,
  },
  
  submitButton: {
    marginBottom: LMN8Spacing.lg,
  },
  
  signupPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: LMN8Spacing.md,
  },
  
  signupText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
  },
  
  welcomeContainer: {
    backgroundColor: LMN8Colors.container,
    borderRadius: LMN8BorderRadius.xl,
    padding: LMN8Spacing.xl,
    alignItems: 'center',
  },
  
  welcomeTitle: {
    ...LMN8Typography.h3,
    textAlign: 'center',
    marginBottom: LMN8Spacing.md,
    color: LMN8Colors.accentPrimary,
  },
  
  welcomeText: {
    ...LMN8Typography.body,
    textAlign: 'center',
    color: LMN8Colors.text85,
    lineHeight: 24,
  },
});
