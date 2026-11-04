import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LMN8Colors, LMN8Typography, LMN8Spacing, LMN8BorderRadius } from '@/constants/LMN8DesignSystem';
import { LMN8Button } from '@/components/ui/LMN8Button';
import { LMN8Input } from '@/components/ui/LMN8Input';
import { useAuth } from '@/contexts/AuthContext';

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  therapeuticGoals?: string;
}

export default function SignupPage() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState<SignupData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    therapeuticGoals: '',
  });

  const [errors, setErrors] = useState<Partial<SignupData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    // TODO: Re-enable validation later
    // const newErrors: Partial<SignupData> = {};

    // if (!formData.fullName.trim()) {
    //   newErrors.fullName = 'Full name is required';
    // }

    // if (!formData.email.trim()) {
    //   newErrors.email = 'Email is required';
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Please enter a valid email';
    // }

    // if (!formData.password) {
    //   newErrors.password = 'Password is required';
    // } else if (formData.password.length < 8) {
    //   newErrors.password = 'Password must be at least 8 characters';
    // }

    // if (formData.password !== formData.confirmPassword) {
    //   newErrors.confirmPassword = 'Passwords do not match';
    // }

    // setErrors(newErrors);
    // return Object.keys(newErrors).length === 0;
    return true; // Skip validation for now
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement actual signup logic
      // For now, just simulate successful signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to Journey Log instead of tabs
      router.push('/(main)/journey-log');
    } catch (error) {
      Alert.alert('Signup Error', 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  const updateFormData = (field: keyof SignupData, value: string) => {
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>METAT8</Text>
          <Text style={styles.tagline}>Your Sacred Space for Therapeutic Growth</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Begin your therapeutic journey with METAT8 KTC
          </Text>

          <LMN8Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(value) => updateFormData('fullName', value)}
            error={errors.fullName}
            autoCapitalize="words"
            autoFocus
          />

          <LMN8Input
            label="Email Address"
            placeholder="Enter your email address"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <LMN8Input
            label="Password"
            placeholder="Create a secure password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            error={errors.password}
            secureTextEntry
            autoComplete="new-password"
            helperText="Must be at least 8 characters"
          />

          <LMN8Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            error={errors.confirmPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <LMN8Input
            label="Date of Birth (Optional)"
            placeholder="MM/DD/YYYY"
            value={formData.dateOfBirth}
            onChangeText={(value) => updateFormData('dateOfBirth', value)}
            keyboardType="numeric"
          />

          <LMN8Input
            label="Therapeutic Goals (Optional)"
            placeholder="What would you like to work on?"
            value={formData.therapeuticGoals}
            onChangeText={(value) => updateFormData('therapeuticGoals', value)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            helperText="e.g., anxiety, depression, personal growth"
          />

          <LMN8Button
            title="Create Account"
            onPress={handleSignup}
            loading={isSubmitting}
            fullWidth
            size="large"
            style={styles.submitButton}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <LMN8Button
              title="Sign In"
              onPress={navigateToLogin}
              variant="secondary"
              size="small"
            />
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>
            By creating an account, you agree to our Terms of Service and Privacy Policy. 
            Your data is stored locally and encrypted for your privacy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  
  submitButton: {
    marginTop: LMN8Spacing.lg,
    marginBottom: LMN8Spacing.lg,
  },
  
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: LMN8Spacing.md,
  },
  
  loginText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
  },
  
  privacyContainer: {
    paddingHorizontal: LMN8Spacing.md,
  },
  
  privacyText: {
    ...LMN8Typography.metadata,
    textAlign: 'center',
    color: LMN8Colors.text60,
    lineHeight: 20,
  },
});
