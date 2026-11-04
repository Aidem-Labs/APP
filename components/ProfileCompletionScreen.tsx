import { LMN8Button } from '@/components/ui/LMN8Button';
import { LMN8BorderRadius, LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface ProfileCompletionScreenProps {
  onComplete: () => void;
}

const analysisSteps = [
  { text: 'Analyzing your responses...', duration: 2000 },
  { text: 'Completing your profile...', duration: 2500 },
  { text: 'Preparing your AI companion...', duration: 3000 },
];

export default function ProfileCompletionScreen({ onComplete }: ProfileCompletionScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showProceedButton, setShowProceedButton] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initial fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start the analysis steps
    startAnalysisSteps();
  }, []);

  const startAnalysisSteps = () => {
    let stepIndex = 0;
    const runStep = () => {
      if (stepIndex < analysisSteps.length) {
        setCurrentStep(stepIndex);
        
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: (stepIndex + 1) / analysisSteps.length,
          duration: analysisSteps[stepIndex].duration,
          useNativeDriver: false,
        }).start();

        // Pulse animation for current step
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();

        setTimeout(() => {
          pulseAnimation.stop();
          stepIndex++;
          if (stepIndex < analysisSteps.length) {
            runStep();
          } else {
            // All steps completed
            setTimeout(() => {
              setShowProceedButton(true);
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }).start();
            }, 500);
          }
        }, analysisSteps[stepIndex].duration);
      }
    };

    runStep();
  };

  const handleProceedToApp = () => {
    onComplete();
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

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logo}>METAT8</Text>
            <View style={styles.logoUnderline} />
          </View>
          <Text style={styles.title}>Profile Completion</Text>
          <Text style={styles.subtitle}>Setting up your personalized AI companion</Text>
        </View>

        {/* Analysis Card */}
        <View style={styles.analysisCard}>
          <View style={styles.cardGradient}>
            {/* Background accent */}
            <View style={styles.cardAccent} />
            
            <View style={styles.cardContent}>
              {/* AI Brain Icon */}
              <Animated.View 
                style={[
                  styles.brainContainer,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <View style={styles.brainIcon}>
                  <Text style={styles.brainEmoji}>🧠</Text>
                </View>
                <View style={styles.brainGlow} />
              </Animated.View>

              {/* Current Step */}
              <View style={styles.stepContainer}>
                <Text style={styles.stepText}>
                  {analysisSteps[currentStep]?.text || 'Preparing...'}
                </Text>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(((currentStep + 1) / analysisSteps.length) * 100)}% Complete
                </Text>
              </View>

              {/* Steps List */}
              <View style={styles.stepsList}>
                {analysisSteps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[
                      styles.stepIndicator,
                      index <= currentStep ? styles.stepCompleted : styles.stepPending
                    ]}>
                      {index < currentStep && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      index <= currentStep ? styles.stepLabelCompleted : styles.stepLabelPending
                    ]}>
                      {step.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Proceed Button */}
        {showProceedButton && (
          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
            <LMN8Button
              title="Proceed to App"
              onPress={handleProceedToApp}
              size="large"
              style={styles.proceedButton}
            />
          </Animated.View>
        )}

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <BlurView intensity={10} tint="dark" style={styles.privacyBlur}>
            <Text style={styles.privacyText}>
              🔒 Your AI companion is being personalized based on your responses. This process is secure and private.
            </Text>
          </BlurView>
        </View>
      </Animated.View>
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

  title: {
    ...LMN8Typography.h1,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: LMN8Spacing.sm,
    color: LMN8Colors.text100,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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

  analysisCard: {
    marginBottom: LMN8Spacing.xl,
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
    alignItems: 'center',
  },

  brainContainer: {
    alignItems: 'center',
    marginBottom: LMN8Spacing.xl,
    position: 'relative',
  },

  brainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${LMN8Colors.accentPrimary}15`,
    borderWidth: 2,
    borderColor: `${LMN8Colors.accentPrimary}30`,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: LMN8Colors.accentPrimary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  brainEmoji: {
    fontSize: 40,
  },

  brainGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${LMN8Colors.accentPrimary}10`,
    zIndex: -1,
  },

  stepContainer: {
    alignItems: 'center',
    marginBottom: LMN8Spacing.xl,
  },

  stepText: {
    ...LMN8Typography.h3,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.md,
  },

  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LMN8Colors.accentPrimary,
    marginHorizontal: 4,
  },

  dot1: {
    opacity: 0.4,
  },

  dot2: {
    opacity: 0.7,
  },

  dot3: {
    opacity: 1,
  },

  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: LMN8Spacing.xl,
  },

  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: `${LMN8Colors.text60}20`,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: LMN8Spacing.sm,
  },

  progressFill: {
    height: '100%',
    backgroundColor: LMN8Colors.accentPrimary,
    borderRadius: 3,
  },

  progressText: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text60,
    fontSize: 12,
  },

  stepsList: {
    width: '100%',
    gap: LMN8Spacing.md,
  },

  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.md,
  },

  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepCompleted: {
    backgroundColor: LMN8Colors.accentPrimary,
  },

  stepPending: {
    backgroundColor: `${LMN8Colors.text60}30`,
    borderWidth: 2,
    borderColor: `${LMN8Colors.text60}50`,
  },

  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  stepLabel: {
    ...LMN8Typography.body,
    fontSize: 14,
    flex: 1,
  },

  stepLabelCompleted: {
    color: LMN8Colors.text100,
  },

  stepLabelPending: {
    color: LMN8Colors.text60,
  },

  buttonContainer: {
    marginBottom: LMN8Spacing.lg,
  },

  proceedButton: {
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
