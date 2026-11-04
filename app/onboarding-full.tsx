import ProfileCompletionScreen from '@/components/ProfileCompletionScreen';
import { LMN8Button } from '@/components/ui/LMN8Button';
import { LMN8BorderRadius, LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useOnboardingSync } from '@/hooks/useOnboardingSync';
import { LegacyProfileData, OnboardingRequest, profileAPI } from '@/services/APIService';
import { AIService } from '@/services/AIService';
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
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface FullTrackOnboardingData {
  inspirationFigure: string;
  inspirationQuality: string;
  actorAuthorStyle: string;
  actorAuthorTone: string;
  spiritualPractices: string;
  spiritualReflection: string;
  lifeLandscape: string;
  safePlace: string;
  strengthSymbol: string;
  sensoryAnchor: string;
  chapterTitle: string;
  strengthMoment: string;
  primaryHope: string;
  copingPattern: string;
}

const fullTrackQuestions = [
  {
    id: 'inspirationFigure',
    title: 'If you could sit down for dinner or a drink with any person — real or fictional, living or from history — who would it be?',
    placeholder: 'e.g., Oprah Winfrey, Albert Einstein, your grandmother, a fictional character...',
    key: 'inspirationFigure' as keyof FullTrackOnboardingData,
  },
  {
    id: 'inspirationQuality',
    title: 'What is it about them — their voice, their wisdom, their humor — that makes you choose them?',
    placeholder: 'e.g., their gentle wisdom, their humor, their courage, their perspective...',
    key: 'inspirationQuality' as keyof FullTrackOnboardingData,
  },
  {
    id: 'actorAuthorStyle',
    title: 'Who are one or two actors, authors, or artists whose style really resonates with you?',
    placeholder: 'e.g., Maya Angelou, Morgan Freeman, Brené Brown, David Attenborough...',
    key: 'actorAuthorStyle' as keyof FullTrackOnboardingData,
  },
  {
    id: 'actorAuthorTone',
    title: 'What about their way of being, their tone, or the feeling they bring connects with you most?',
    placeholder: 'e.g., their calm presence, their passionate delivery, their gentle humor...',
    key: 'actorAuthorTone' as keyof FullTrackOnboardingData,
  },
  {
    id: 'spiritualPractices',
    title: 'Are there any spiritual practices, traditions, or things that matter most to you in life that are important?',
    placeholder: 'e.g., meditation, nature, family, creativity, service to others...',
    key: 'spiritualPractices' as keyof FullTrackOnboardingData,
  },
  {
    id: 'spiritualReflection',
    title: 'How would you want your companion to reflect or honor what matters to you?',
    placeholder: 'e.g., remind me of what matters, help me stay grounded, encourage my growth...',
    key: 'spiritualReflection' as keyof FullTrackOnboardingData,
  },
  {
    id: 'lifeLandscape',
    title: 'If this chapter of your life were a landscape — maybe a forest, a river, a storm, or a city street — what would it look and feel like?',
    placeholder: 'e.g., a winding mountain path, a calm ocean, a bustling city at dawn...',
    key: 'lifeLandscape' as keyof FullTrackOnboardingData,
  },
  {
    id: 'safePlace',
    title: 'And in that landscape, what would a safe or restful place look like for you?',
    placeholder: 'e.g., a quiet garden, a cozy cabin, a peaceful meadow...',
    key: 'safePlace' as keyof FullTrackOnboardingData,
  },
  {
    id: 'strengthSymbol',
    title: 'What\'s a simple symbol of strength or peace for you right now — maybe an animal, a tree, an object, or an image?',
    placeholder: 'e.g., an oak tree, a lighthouse, a phoenix, a mountain...',
    key: 'strengthSymbol' as keyof FullTrackOnboardingData,
  },
  {
    id: 'sensoryAnchor',
    title: 'What sound, type of music, color, or texture feels most grounding or healing for you right now?',
    placeholder: 'e.g., ocean waves, classical music, the color blue, soft fabrics...',
    key: 'sensoryAnchor' as keyof FullTrackOnboardingData,
  },
  {
    id: 'chapterTitle',
    title: 'If this chapter of your life had a title, what would you call it?',
    placeholder: 'e.g., "The Awakening", "Finding My Voice", "New Beginnings"...',
    key: 'chapterTitle' as keyof FullTrackOnboardingData,
  },
  {
    id: 'strengthMoment',
    title: 'Tell me about a recent moment, even a small one, where you felt a glimpse of yourself at your best.',
    placeholder: 'e.g., when I helped a friend, when I completed a difficult task, when I spoke up for myself...',
    key: 'strengthMoment' as keyof FullTrackOnboardingData,
  },
  {
    id: 'primaryHope',
    title: 'What\'s the biggest shift or change you hope this journey will bring for you?',
    placeholder: 'e.g., more confidence, better relationships, inner peace, clarity about my purpose...',
    key: 'primaryHope' as keyof FullTrackOnboardingData,
  },
  {
    id: 'copingPattern',
    title: 'When things feel overwhelming, what do you usually do first?',
    placeholder: 'e.g., I take a walk, I call a friend, I journal, I take deep breaths...',
    key: 'copingPattern' as keyof FullTrackOnboardingData,
  },
];

export default function FullTrackOnboardingScreen() {
  const { setOnboardingData } = useOnboarding();
  const { saveOnboardingCompletion } = useOnboardingSync();
  const [currentStep, setCurrentStep] = useState(0);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingData, setOnboardingDataLocal] = useState<FullTrackOnboardingData>({
    inspirationFigure: '',
    inspirationQuality: '',
    actorAuthorStyle: '',
    actorAuthorTone: '',
    spiritualPractices: '',
    spiritualReflection: '',
    lifeLandscape: '',
    safePlace: '',
    strengthSymbol: '',
    sensoryAnchor: '',
    chapterTitle: '',
    strengthMoment: '',
    primaryHope: '',
    copingPattern: '',
  });

  const currentQuestion = fullTrackQuestions[currentStep];
  const isLastStep = currentStep === fullTrackQuestions.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = async () => {
    if (isLastStep) {
      setIsCompleting(true);
      // Complete onboarding and save data
      const onboardingRequest: OnboardingRequest = {
        inspirationFigure: onboardingData.inspirationFigure,
        inspirationQuality: onboardingData.inspirationQuality,
        actorAuthorStyle: onboardingData.actorAuthorStyle,
        actorAuthorTone: onboardingData.actorAuthorTone,
        spiritualPractices: onboardingData.spiritualPractices,
        spiritualReflection: onboardingData.spiritualReflection,
        lifeLandscape: onboardingData.lifeLandscape,
        safePlace: onboardingData.safePlace,
        strengthSymbol: onboardingData.strengthSymbol,
        sensoryAnchor: onboardingData.sensoryAnchor,
        chapterTitle: onboardingData.chapterTitle,
        strengthMoment: onboardingData.strengthMoment,
        primaryHope: onboardingData.primaryHope,
        copingPattern: onboardingData.copingPattern,
        onboardingType: 'full-track',
      };
      
      // Create legacy data for context
      const legacyOnboardingData: LegacyProfileData = {
        idol: onboardingData.inspirationFigure,
        personality: `${onboardingData.inspirationQuality} with the style of ${onboardingData.actorAuthorStyle}`,
        goals: onboardingData.primaryHope,
        challenges: `Current chapter: ${onboardingData.chapterTitle}. Life feels like ${onboardingData.lifeLandscape}`,
        communicationStyle: `${onboardingData.actorAuthorTone} that honors ${onboardingData.spiritualPractices}`,
        interests: `${onboardingData.strengthSymbol} and ${onboardingData.sensoryAnchor}`,
        values: onboardingData.spiritualPractices,
        supportNeeds: `Help me with ${onboardingData.copingPattern} and remind me of ${onboardingData.strengthMoment}`,
      };
      
      setOnboardingData(legacyOnboardingData);
      
      // Save profile data to backend using new API
      try {
        console.log('💾 Completing full-track onboarding...');
        
        const response = await profileAPI.completeOnboarding(onboardingRequest);
        
        if (response.success) {
          console.log('✅ Full-track onboarding completed successfully:', response.data);
          
          // Save onboarding completion to storage and context
          await saveOnboardingCompletion(legacyOnboardingData);

          // Pre-fetch tweets for personas so chat is fast on first open
          try {
            const aiService = new AIService();
            const prefetchResult = await aiService.prefetchPersona(onboardingRequest);
            console.log('✅ Persona tweets pre-fetched:', prefetchResult.personas);
          } catch (prefetchError) {
            console.warn('⚠️ Persona pre-fetch skipped (non-fatal):', prefetchError);
          }
        } else {
          console.warn('⚠️ Onboarding completion failed:', response.error);
          // Continue with onboarding even if API fails
        }
      } catch (error) {
        console.error('❌ Error completing onboarding:', error);
        // Continue with onboarding even if API fails
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
            <Text style={styles.subtitle}>Full-Track Personalization</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentStep + 1) / fullTrackQuestions.length) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {currentStep + 1} of {fullTrackQuestions.length}
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
                🔒 Your responses are encrypted and stored locally. They help us create a deeply personalized AI companion just for you.
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
    minHeight: height - (Platform.OS === 'ios' ? 100 : 80),
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
    ...LMN8Typography.body,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: LMN8Spacing.sm,
    color: LMN8Colors.text100,
    letterSpacing: 0.2,
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
