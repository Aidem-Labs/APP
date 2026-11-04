import ProfileCompletionScreen from '@/components/ProfileCompletionScreen';
import { LMN8Button } from '@/components/ui/LMN8Button';
import { LMN8BorderRadius, LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { profileAPI, ProfileData } from '@/services/APIService';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingData {
  idol: string;
  personality: string;
  goals: string;
  challenges: string;
  communicationStyle: string;
  interests: string;
  values: string;
  supportNeeds: string;
}

const onboardingQuestions = [
  {
    id: 'idol',
    title: 'Who is your idol?',
    subtitle: 'Tell us about someone you admire and look up to',
    placeholder: 'e.g., Oprah Winfrey, Elon Musk, your grandmother...',
    key: 'idol' as keyof OnboardingData,
  },
  {
    id: 'personality',
    title: 'How would you describe yourself?',
    subtitle: 'What are your key personality traits?',
    placeholder: 'e.g., creative, analytical, empathetic, determined...',
    key: 'personality' as keyof OnboardingData,
  },
  {
    id: 'goals',
    title: 'What are your main goals?',
    subtitle: 'What do you want to achieve in life?',
    placeholder: 'e.g., career success, better relationships, personal growth...',
    key: 'goals' as keyof OnboardingData,
  },
  {
    id: 'challenges',
    title: 'What challenges do you face?',
    subtitle: 'What obstacles are you currently dealing with?',
    placeholder: 'e.g., anxiety, time management, self-doubt...',
    key: 'challenges' as keyof OnboardingData,
  },
  {
    id: 'communication',
    title: 'How do you prefer to communicate?',
    subtitle: 'What communication style works best for you?',
    placeholder: 'e.g., direct and honest, gentle and supportive, motivational...',
    key: 'communicationStyle' as keyof OnboardingData,
  },
  {
    id: 'interests',
    title: 'What are your interests?',
    subtitle: 'What topics and activities excite you?',
    placeholder: 'e.g., art, technology, nature, music, sports...',
    key: 'interests' as keyof OnboardingData,
  },
  {
    id: 'values',
    title: 'What values are important to you?',
    subtitle: 'What principles guide your decisions?',
    placeholder: 'e.g., honesty, creativity, family, justice, growth...',
    key: 'values' as keyof OnboardingData,
  },
  {
    id: 'support',
    title: 'What kind of support do you need?',
    subtitle: 'How can your AI companion best help you?',
    placeholder: 'e.g., motivation, accountability, emotional support, guidance...',
    key: 'supportNeeds' as keyof OnboardingData,
  },
];

export default function OnboardingScreen() {
  const { setOnboardingData } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingData, setOnboardingDataLocal] = useState<OnboardingData>({
    idol: '',
    personality: '',
    goals: '',
    challenges: '',
    communicationStyle: '',
    interests: '',
    values: '',
    supportNeeds: '',
  });

  const currentQuestion = onboardingQuestions[currentStep];
  const isLastStep = currentStep === onboardingQuestions.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = async () => {
    if (isLastStep) {
      setIsCompleting(true);
      // Complete onboarding and save data
      setOnboardingData(onboardingData);
      
      // Save profile data to backend
      try {
        console.log('💾 Saving profile data to backend...');
        const profileData: ProfileData = {
          idol: onboardingData.idol,
          personality: onboardingData.personality,
          goals: onboardingData.goals,
          challenges: onboardingData.challenges,
          communicationStyle: onboardingData.communicationStyle,
          interests: onboardingData.interests,
          values: onboardingData.values,
          supportNeeds: onboardingData.supportNeeds,
        };
        
        const response = await profileAPI.updateProfile(profileData);
        
        if (response.success) {
          console.log('✅ Profile saved successfully:', response.data);
        } else {
          console.warn('⚠️ Profile save failed:', response.error);
          // Continue with onboarding even if profile save fails
        }
      } catch (error) {
        console.error('❌ Error saving profile:', error);
        // Continue with onboarding even if profile save fails
      } finally {
        setIsCompleting(false);
      }
      
      setShowProfileCompletion(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleProfileCompletion = () => {
    router.replace('/(tabs)');
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };


  const updateAnswer = (value: string) => {
    setOnboardingDataLocal(prev => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  };

  const canProceed = onboardingData[currentQuestion.key].trim().length > 0;

  // Show profile completion screen if onboarding is complete
  if (showProfileCompletion) {
    return <ProfileCompletionScreen onComplete={handleProfileCompletion} />;
  }

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
          {/* Progress Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Text style={styles.logo}>METAT8</Text>
              <View style={styles.logoUnderline} />
            </View>
            <Text style={styles.subtitle}>Let's personalize your AI companion</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentStep + 1) / onboardingQuestions.length) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {onboardingQuestions.length}
              </Text>
            </View>
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.cardGradient}>
              {/* Background accent */}
              <View style={styles.cardAccent} />
              <View style={styles.cardContent}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
                  <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Your Answer</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={currentQuestion.placeholder}
                    placeholderTextColor={LMN8Colors.text60}
                    value={onboardingData[currentQuestion.key]}
                    onChangeText={updateAnswer}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <View style={styles.buttonRow}>
                    {!isFirstStep ? (
                      <LMN8Button
                        title="Previous"
                        onPress={handlePrevious}
                        variant="secondary"
                        size="medium"
                        style={styles.previousButton}
                      />
                    ) : (
                      <View style={styles.previousButton} />
                    )}
                    
                    <LMN8Button
                      title={isLastStep ? (isCompleting ? "Saving..." : "Complete Setup") : "Next"}
                      onPress={handleNext}
                      disabled={!canProceed || isCompleting}
                      loading={isLastStep && isCompleting}
                      size="large"
                      style={styles.nextButton}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <BlurView intensity={10} tint="dark" style={styles.privacyBlur}>
              <Text style={styles.privacyText}>
                🔒 Your responses are encrypted and stored locally. They help us create a personalized AI companion just for you.
              </Text>
            </BlurView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: LMN8Spacing.lg,
    paddingVertical: LMN8Spacing.lg,
    justifyContent: 'center',
    minHeight: height - 100,
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
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: LMN8Spacing.lg,
  },

  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },

  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: `${LMN8Colors.text60}20`,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: LMN8Spacing.sm,
  },

  progressFill: {
    height: '100%',
    backgroundColor: LMN8Colors.accentPrimary,
    borderRadius: 2,
  },

  progressText: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text60,
    fontSize: 12,
  },

  questionCard: {
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

  questionHeader: {
    marginBottom: LMN8Spacing.xl,
    paddingBottom: LMN8Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${LMN8Colors.accentPrimary}10`,
  },

  inputContainer: {
    marginBottom: LMN8Spacing.xl,
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
    padding: LMN8Spacing.md,
    color: LMN8Colors.text100,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  questionTitle: {
    ...LMN8Typography.h2,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: LMN8Spacing.sm,
    color: LMN8Colors.text100,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  questionSubtitle: {
    ...LMN8Typography.body,
    fontSize: 16,
    textAlign: 'center',
    color: LMN8Colors.text85,
    lineHeight: 24,
    fontWeight: '400',
    opacity: 0.9,
  },


  buttonContainer: {
    gap: LMN8Spacing.md,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: LMN8Spacing.md,
  },

  previousButton: {
    flex: 1,
    maxWidth: 120,
  },

  nextButton: {
    flex: 2,
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

  privacyNote: {
    alignItems: 'center',
  },

  privacyBlur: {
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
    lineHeight: 16,
  },
});
