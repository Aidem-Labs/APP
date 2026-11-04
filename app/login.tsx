import { LMN8Alert } from '@/components/ui/LMN8Alert';
import { LMN8Button } from '@/components/ui/LMN8Button';
import { LMN8BorderRadius, LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { useAuth } from '@/contexts/AuthContext';
import { useLMN8Alert } from '@/hooks/useLMN8Alert';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import PasswordResetModal from '@/components/PasswordResetModal';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export interface LoginData {
  email: string;
  password: string;
}

const { width, height } = Dimensions.get('window');

export default function LoginPageDesign3Compact() {
  const { login } = useAuth();
  const { alert, hideAlert, showError } = useLMN8Alert();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);


  const validateForm = (): boolean => {
    // TODO: Re-enable validation later
    // const newErrors: Partial<LoginData> = {};

    // if (!formData.email.trim()) {
    //   newErrors.email = 'Email is required';
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Please enter a valid email';
    // }

    // if (!formData.password) {
    //   newErrors.password = 'Password is required';
    // }

    // setErrors(newErrors);
    // return Object.keys(newErrors).length === 0;
    return true; // Skip validation for now
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Trim email before sending to prevent trailing space issues
      const trimmed = { email: formData.email.trim(), password: formData.password };
      const result = await login(trimmed);
      
      console.log('🔍 Login result:', result);
      
      // Navigate based on the returned onboarding status
      if (result.isOnboardingComplete) {
        console.log('✅ Onboarding complete - redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('ℹ️ Onboarding not complete - redirecting to onboarding selection');
        router.replace('/onboarding-selection');
      }
    } catch (error) {
      showError('Invalid email and password. Please try again.', 'Login Failed');
    } finally {
      setIsSubmitting(false);
    }
  };



  const updateFormData = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      {/* Background with gradient overlay */}
      <LinearGradient
        colors={[
          LMN8Colors.bgDark,
          '#edf2f2',
          LMN8Colors.bgDark,
          '#f6f8f8',
          LMN8Colors.bgDark
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating background elements */}
      <View style={styles.floatingElement1} />
      <View style={styles.floatingElement2} />
      <View style={styles.floatingElement3} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logo}>METAT8</Text>
              <View style={styles.logoUnderline} />
            </View>
            <Text style={styles.subtitle}>Your Sacred Space</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.cardGradient}>
              {/* Background accent */}
              <View style={styles.cardAccent} />
              <View style={styles.cardContent}>
                <View style={styles.loginHeader}>
                  <Text style={styles.welcomeTitle}>Welcome Back</Text>
                </View>
                
                <View style={styles.formFields}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Username</Text>
                    <TextInput
                      style={[styles.textInput, errors.email && styles.textInputError]}
                      placeholder="your.username"
                      placeholderTextColor={LMN8Colors.text60}
                      value={formData.email}
                      onChangeText={(value) => updateFormData('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoFocus
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={[styles.passwordInput, errors.password && styles.textInputError]}
                        placeholder="Enter your password"
                        placeholderTextColor={LMN8Colors.text60}
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.eyeIcon}>
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>
                </View>

                <LMN8Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={isSubmitting}
                  fullWidth
                  size="large"
                  style={styles.primaryButton}
                />

                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10 }} onPress={() => setShowResetModal(true)}>
                  <Text style={{ color: LMN8Colors.accentPrimary, fontSize: 14 }}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Privacy Badge */}
          <View style={styles.privacyBadge}>
            <BlurView intensity={10} tint="dark" style={styles.privacyBadgeBlur}>
              <Text style={styles.privacyText}>
                🛡️ End-to-end encrypted • Locally stored
              </Text>
            </BlurView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <LMN8Alert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        confirmText={alert.confirmText}
        onConfirm={alert.onConfirm}
        onDismiss={hideAlert}
        type={alert.type}
      />

      <PasswordResetModal visible={showResetModal} onClose={() => setShowResetModal(false)} userEmail={formData.email} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LMN8Colors.bgDark,
  },
  
  content: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: LMN8Spacing.lg,
    paddingVertical: LMN8Spacing.lg,
    minHeight: height - 100, // Account for status bar and navigation
  },

  floatingElement1: {
    position: 'absolute',
    top: height * 0.1,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${LMN8Colors.accentPrimary}08`,
    opacity: 0.6,
  },

  floatingElement2: {
    position: 'absolute',
    top: height * 0.4,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: `${LMN8Colors.accentPrimary}05`,
    opacity: 0.4,
  },

  floatingElement3: {
    position: 'absolute',
    bottom: height * 0.2,
    right: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: `${LMN8Colors.accentPrimary}06`,
    opacity: 0.3,
  },

  header: {
    alignItems: 'center',
    marginBottom: LMN8Spacing.xl,
  },

  logoWrapper: {
    alignItems: 'center',
    marginBottom: LMN8Spacing.sm,
  },

  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: LMN8Colors.text100,
    letterSpacing: 3,
    textShadowColor: `${LMN8Colors.accentPrimary}40`,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },

  logoUnderline: {
    width: 60,
    height: 3,
    backgroundColor: LMN8Colors.accentPrimary,
    borderRadius: 2,
    marginTop: LMN8Spacing.xs,
    shadowColor: LMN8Colors.accentPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },

  subtitle: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.5,
  },

  loginCard: {
    marginBottom: LMN8Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },

  cardGradient: {
    borderRadius: 24,
    backgroundColor: `${LMN8Colors.container}98`,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}20`,
    overflow: 'hidden',
    position: 'relative',
  },

  cardAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${LMN8Colors.accentPrimary}08`,
    transform: [{ translateX: 30 }, { translateY: -30 }],
    zIndex: 1,
  },

  cardContent: {
    padding: LMN8Spacing.xl,
    position: 'relative',
    zIndex: 2,
  },

  loginHeader: {
    marginBottom: LMN8Spacing.xl,
    paddingBottom: LMN8Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${LMN8Colors.accentPrimary}10`,
  },

  welcomeTitle: {
    ...LMN8Typography.h2,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: LMN8Colors.text100,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  formFields: {
    marginBottom: LMN8Spacing.lg,
    gap: LMN8Spacing.md,
  },

  inputContainer: {
    marginBottom: LMN8Spacing.sm,
  },

  inputLabel: {
    ...LMN8Typography.label,
    marginBottom: LMN8Spacing.sm,
    color: LMN8Colors.text85,
    fontSize: 14,
    fontWeight: '600',
  },

  textInput: {
    ...LMN8Typography.body,
    backgroundColor: `${LMN8Colors.container}60`,
    borderWidth: 2,
    borderColor: `${LMN8Colors.accentPrimary}20`,
    borderRadius: 12,
    paddingHorizontal: LMN8Spacing.md,
    paddingVertical: 10,
    color: LMN8Colors.text100,
    fontSize: 16,
    lineHeight: 22,
    height: 52,
    includeFontPadding: false,
    textAlignVertical: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  passwordInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    ...LMN8Typography.body,
    backgroundColor: `${LMN8Colors.container}60`,
    borderWidth: 2,
    borderColor: `${LMN8Colors.accentPrimary}20`,
    borderRadius: 12,
    paddingHorizontal: LMN8Spacing.md,
    paddingVertical: 10,
    paddingRight: 50, // Space for eye button
    color: LMN8Colors.text100,
    fontSize: 16,
    lineHeight: 22,
    height: 52,
    includeFontPadding: false,
    textAlignVertical: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  eyeIcon: {
    fontSize: 20,
    color: LMN8Colors.text60,
  },

  textInputError: {
    borderColor: LMN8Colors.error,
  },

  errorText: {
    ...LMN8Typography.metadata,
    color: LMN8Colors.error,
    marginTop: LMN8Spacing.xs,
    paddingHorizontal: LMN8Spacing.sm,
  },

  primaryButton: {
    marginBottom: LMN8Spacing.md,
    borderRadius: 16,
    shadowColor: LMN8Colors.accentPrimary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },



  privacyBadge: {
    alignItems: 'center',
  },

  privacyBadgeBlur: {
    borderRadius: LMN8BorderRadius.lg,
    overflow: 'hidden',
    paddingHorizontal: LMN8Spacing.md,
    paddingVertical: LMN8Spacing.sm,
  },

  privacyText: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text60,
    fontSize: 11,
    textAlign: 'center',
  },
});
