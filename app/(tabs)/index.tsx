import { CelebrationModal } from '@/components/CelebrationModal';
import { JourneyThemeCard } from '@/components/JourneyThemeCard';
import { Milestone, MilestoneCard } from '@/components/MilestoneCard';
import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { clinicianSharingAPI, journalAPI } from '@/services/APIService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const DAILY_REFLECTIONS = [
  "You are exactly where you need to be in this moment.",
  "Healing is not linear, and that's perfectly okay.",
  "Your journey is unique and valid.",
  "Progress, no matter how small, is still progress.",
  "You deserve peace, healing, and belonging.",
  "Each step forward is an act of courage.",
];

// Milestones data - TODO: Load from backend
const MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'First Step',
    description: 'Complete your first journal entry',
    icon: 'footsteps-outline',
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
    achieved: true,
    achievedDate: '2025-10-25',
  },
  {
    id: '2',
    title: '5 Sessions',
    description: 'Complete 5 therapy sessions',
    icon: 'flash-outline',
    color: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
    achieved: false,
    progress: 60,
  },
  {
    id: '3',
    title: 'Week Warrior',
    description: '7 consecutive days of check-ins',
    icon: 'flame-outline',
    color: '#ef4444',
    gradient: ['#ef4444', '#dc2626'],
    achieved: false,
    progress: 42,
  },
  {
    id: '4',
    title: 'Mood Master',
    description: 'Improve mood by 30%',
    icon: 'happy-outline',
    color: '#ec4899',
    gradient: ['#ec4899', '#db2777'],
    achieved: false,
    progress: 20,
  },
  {
    id: '5',
    title: 'Reflective Soul',
    description: 'Complete 20 journal entries',
    icon: 'book-outline',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
    achieved: false,
    progress: 15,
  },
  {
    id: '6',
    title: 'Mindful Month',
    description: '30 days of mindfulness practice',
    icon: 'infinite-outline',
    color: '#06b6d4',
    gradient: ['#06b6d4', '#0891b2'],
    achieved: false,
    progress: 10,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { onboardingData } = useOnboarding();
  const { sessions } = useChat();
  const [dailyReflection, setDailyReflection] = useState('');
  const [currentStreak, setCurrentStreak] = useState(3); // TODO: Load from backend
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  const [journalEntriesCount, setJournalEntriesCount] = useState(0);
  const [showClinicianSharingWarning, setShowClinicianSharingWarning] = useState(false);

  // Set daily reflection based on day of year
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyReflection(DAILY_REFLECTIONS[dayOfYear % DAILY_REFLECTIONS.length]);
  }, []);

  // Check for new achievements - TODO: Integrate with backend
  useEffect(() => {
    // Simulate achievement unlock
    // In real app, this would come from backend when user completes action
  }, []);

  const loadHomeStats = async () => {
    try {
      // Fetch count + clinician sharing preferences in one pass.
      const [journalResponse, sharingResponse] = await Promise.all([
        journalAPI.getEntries(1, 1),
        clinicianSharingAPI.getPreferences(),
      ]);

      if (journalResponse.success && journalResponse.data) {
        const totalFromPagination = journalResponse.data.pagination?.total;
        if (typeof totalFromPagination === 'number') {
          setJournalEntriesCount(totalFromPagination);
        } else {
          setJournalEntriesCount(journalResponse.data.data?.length || 0);
        }
      }

      if (sharingResponse.success && sharingResponse.data) {
        const preferences = sharingResponse.data.data;
        const shareAIConversationSummary =
          preferences?.shareAIConversationSummary ?? sharingResponse.data.shareAIConversationSummary ?? true;
        const shareJournalEntrySummary =
          preferences?.shareJournalEntrySummary ?? sharingResponse.data.shareJournalEntrySummary ?? true;

        const isAnySummaryEnabled = shareAIConversationSummary || shareJournalEntrySummary;
        setShowClinicianSharingWarning(!isAnySummaryEnabled);
      }
    } catch (error) {
      console.error('Failed to load home stats:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHomeStats();
    }, [])
  );

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Skip auth logic for now - go directly to home
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.replace('/login');
  //   }
  // }, [isLoading, isAuthenticated]);

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <Text style={styles.loadingText}>Loading...</Text>
  //     </View>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Therapeutic Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.fullName || user?.email?.split('@')[0] || 'Traveler'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/(tabs)/notifications')} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={26} color={LMN8Colors.text100} />
          </TouchableOpacity>
          <Text style={styles.welcomeSubtitle}>
            {user?.patientGreetingName
              ? `Dear ${user.patientGreetingName}, welcome to your healing space`
              : 'Welcome to your healing space'}
          </Text>
        </View>

        {/* Daily Reflection Card */}
        <View style={styles.reflectionCard}>
          <LinearGradient
            colors={[`${LMN8Colors.accentPrimary}15`, `${LMN8Colors.accentPrimary}08`]}
            style={styles.reflectionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.reflectionIconContainer}>
              <Ionicons name="leaf-outline" size={28} color={LMN8Colors.accentPrimary} />
            </View>
            <Text style={styles.reflectionLabel}>Today's Reflection</Text>
            <Text style={styles.reflectionText}>{dailyReflection}</Text>
          </LinearGradient>
        </View>

        {showClinicianSharingWarning && (
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning-outline" size={20} color="#f59e0b" />
              <Text style={styles.warningTitle}>Clinician Summary Sharing Is Off</Text>
            </View>
            <Text style={styles.warningText}>
              Turn on at least one summary in Settings so your clinician can understand your progress over time.
              We only share summaries, never word-for-word conversations.
            </Text>
            <TouchableOpacity
              style={styles.warningCTA}
              onPress={() => router.push('/(tabs)/settings')}
              activeOpacity={0.8}
            >
              <Text style={styles.warningCTAText}>Open Settings</Text>
              <Ionicons name="chevron-forward" size={16} color={LMN8Colors.text100} />
            </TouchableOpacity>
          </View>
        )}

        {/* Conversation Summaries */}
        <TouchableOpacity
          style={styles.summaryAccessCard}
          onPress={() => router.push('/(main)/clinician-summaries')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[`${LMN8Colors.accentSecondary}25`, `${LMN8Colors.accentSecondary}12`]}
            style={styles.summaryAccessGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.summaryAccessLeft}>
              <View style={styles.summaryAccessIcon}>
                <Ionicons name="document-text-outline" size={22} color={LMN8Colors.accentSecondary} />
              </View>
              <View style={styles.summaryAccessTextWrap}>
                <Text style={styles.summaryAccessTitle}>Conversation Summaries</Text>
                <Text style={styles.summaryAccessText}>
                  See what your clinician can view from your AI conversation summaries.
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={LMN8Colors.text85} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Assigned Homework */}
        <TouchableOpacity
          style={styles.summaryAccessCard}
          onPress={() => router.push('/(tabs)/homework')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[`${LMN8Colors.accentPrimary}25`, `${LMN8Colors.accentPrimary}12`]}
            style={[styles.summaryAccessGradient, styles.homeworkAccessGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.summaryAccessLeft}>
              <View style={[styles.summaryAccessIcon, styles.homeworkAccessIcon]}>
                <Ionicons name="clipboard-outline" size={22} color={LMN8Colors.accentPrimary} />
              </View>
              <View style={styles.summaryAccessTextWrap}>
                <Text style={styles.summaryAccessTitle}>Homework</Text>
                <Text style={styles.summaryAccessText}>View and update homework assigned by your care team.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={LMN8Colors.text85} />
          </LinearGradient>
        </TouchableOpacity>
        {/* Journey Progress */}
        <View style={styles.progressSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Healing Journey</Text>
            <Text style={styles.sectionSubtitle}>Every step matters</Text>
          </View>
          
          <View style={styles.progressCards}>
            <View style={styles.progressCard}>
              <View style={styles.progressIconCircle}>
                <Ionicons name="book-outline" size={22} color={LMN8Colors.accentPrimary} />
              </View>
              <Text style={styles.progressNumber}>{journalEntriesCount}</Text>
              <Text style={styles.progressLabel}>Journal Entries</Text>
            </View>
            
            <View style={styles.progressCard}>
              <View style={styles.progressIconCircle}>
                <Ionicons name="chatbubbles-outline" size={22} color={LMN8Colors.accentPrimary} />
              </View>
              <Text style={styles.progressNumber}>{sessions.filter(s => s.messageCount > 0).length}</Text>
              <Text style={styles.progressLabel}>Conversations</Text>
            </View>
            
            <View style={styles.progressCard}>
              <View style={styles.progressIconCircle}>
                <Ionicons name="trophy-outline" size={22} color={LMN8Colors.accentPrimary} />
              </View>
              <Text style={styles.progressNumber}>0</Text>
              <Text style={styles.progressLabel}>Milestones</Text>
            </View>
          </View>
        </View>

        {/* Streak & Progress - temporarily hidden */}
        {/*
        <View style={styles.streakSection}>
          <View style={styles.streakCard}>
            <LinearGradient
              colors={['#f59e0b25', '#f59e0b15']}
              style={styles.streakGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.streakContent}>
                <View style={styles.streakIconContainer}>
                  <Ionicons name="flame" size={36} color="#f59e0b" />
                </View>
                <View style={styles.streakTextContainer}>
                  <Text style={styles.streakNumber}>{currentStreak} Days</Text>
                  <Text style={styles.streakLabel}>Current Streak</Text>
                </View>
                <TouchableOpacity style={styles.streakInfoButton}>
                  <Ionicons name="information-circle-outline" size={20} color={LMN8Colors.text60} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
        */}

        {/* Milestones & Achievements */}
        <View style={styles.milestonesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Achievements</Text>
            <Text style={styles.sectionSubtitle}>Celebrate every milestone</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.milestonesScrollContent}
          >
            {MILESTONES.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} size="medium" />
            ))}
          </ScrollView>

          {/* Next milestone progress */}
          <View style={styles.nextMilestoneCard}>
            <View style={styles.nextMilestoneHeader}>
              <Text style={styles.nextMilestoneTitle}>Next Milestone</Text>
              <Text style={styles.nextMilestoneProgress}>3/5 Sessions</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={[styles.progressBarFill, { width: '60%' }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
            <Text style={styles.nextMilestoneDescription}>
              Complete 2 more sessions to unlock "5 Sessions" badge!
            </Text>
          </View>
        </View>

        {/* Journey Theme Card */}
        <View style={styles.journeyThemeSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Journey Theme</Text>
            <Text style={styles.sectionSubtitle}>Personalize your experience</Text>
          </View>
          <JourneyThemeCard />
        </View>

        {/* Therapeutic Actions */}
        <View style={styles.therapeuticActions}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What feels right today?</Text>
            <Text style={styles.sectionSubtitle}>Choose your path forward</Text>
          </View>

          <TouchableOpacity 
            style={styles.primaryActionCard}
            onPress={() => router.push('/(main)/new-entry')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[`${LMN8Colors.accentPrimary}25`, `${LMN8Colors.accentPrimary}15`]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIconLarge}>
                    <Ionicons name="create-outline" size={32} color={LMN8Colors.accentPrimary} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitleLarge}>Begin Journaling</Text>
                    <Text style={styles.actionDescriptionLarge}>Process your thoughts and feelings</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={LMN8Colors.text60} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryActionCard}
            onPress={() => router.push('/(tabs)/chat')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[`${LMN8Colors.accentSecondary}20`, `${LMN8Colors.accentSecondary}10`]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <View style={styles.actionIconLarge}>
                    <Ionicons name="heart-outline" size={32} color={LMN8Colors.accentSecondary} />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitleLarge}>Talk with Your Guide</Text>
                    <Text style={styles.actionDescriptionLarge}>Your AI companion is here to listen</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={LMN8Colors.text60} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={styles.secondaryActionCard}
              onPress={() => router.push('/(tabs)/journey-log')}
              activeOpacity={0.7}
            >
              <Ionicons name="trending-up-outline" size={24} color={LMN8Colors.accentPrimary} />
              <Text style={styles.secondaryActionText}>View Progress</Text>
            </TouchableOpacity>
            
            {user?.showCommunity !== false && (
              <TouchableOpacity 
                style={styles.secondaryActionCard}
                onPress={() => router.push('/(main)/community')}
                activeOpacity={0.7}
              >
                <Ionicons name="people-outline" size={24} color={LMN8Colors.accentPrimary} />
                <Text style={styles.secondaryActionText}>Community</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Safe Space Reminder */}
        <View style={styles.safeSpaceCard}>
          <View style={styles.safeSpaceIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color={LMN8Colors.accentPrimary} />
          </View>
          <View style={styles.safeSpaceTextContainer}>
            <Text style={styles.safeSpaceTitle}>This is Your Safe Space</Text>
            <Text style={styles.safeSpaceText}>
              Everything you share here is private and secure. You're part of a supportive community on a shared journey toward healing and growth.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Celebration Modal */}
      {celebrationData && (
        <CelebrationModal
          visible={showCelebration}
          title={celebrationData.title}
          message={celebrationData.message}
          icon={celebrationData.icon}
          color={celebrationData.color}
          gradient={celebrationData.gradient}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LMN8Colors.bgDark,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: LMN8Spacing.xl,
    paddingTop: 60, // Account for status bar
    paddingBottom: 120, // Extra padding for tab bar
  },

  // Floating background elements - softer, more calming
  floatingElement1: {
    position: 'absolute',
    top: height * 0.15,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${LMN8Colors.accentPrimary}06`,
    opacity: 0.4,
  },

  floatingElement2: {
    position: 'absolute',
    top: height * 0.5,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: `${LMN8Colors.accentSecondary}04`,
    opacity: 0.3,
  },

  floatingElement3: {
    position: 'absolute',
    bottom: height * 0.15,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: `${LMN8Colors.accentHighlight}05`,
    opacity: 0.25,
  },

  // Header - Calming and welcoming
  header: {
    marginBottom: LMN8Spacing.xxl,
  },

  notificationButton: { position: 'absolute', top: 0, right: 0, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: LMN8Colors.container, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(23, 112, 110, 0.12)' },

  greetingContainer: {
    marginBottom: LMN8Spacing.sm,
  },

  greetingText: {
    ...LMN8Typography.body,
    fontSize: 18,
    fontWeight: '300',
    color: LMN8Colors.text85,
    letterSpacing: 0.5,
  },

  userName: {
    ...LMN8Typography.h1,
    fontSize: 32,
    fontWeight: '600',
    color: LMN8Colors.text100,
    letterSpacing: 0.3,
    marginTop: LMN8Spacing.xs,
  },

  welcomeSubtitle: {
    ...LMN8Typography.body,
    fontSize: 15,
    fontWeight: '300',
    color: LMN8Colors.text60,
    letterSpacing: 0.8,
    marginTop: LMN8Spacing.sm,
  },

  // Daily Reflection Card - Calming and inspirational
  reflectionCard: {
    marginBottom: LMN8Spacing.xxl,
    borderRadius: 20,
    overflow: 'hidden',
  },

  reflectionGradient: {
    padding: LMN8Spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}20`,
  },

  reflectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${LMN8Colors.accentPrimary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LMN8Spacing.md,
  },

  reflectionLabel: {
    ...LMN8Typography.label,
    fontSize: 11,
    fontWeight: '600',
    color: LMN8Colors.accentPrimary,
    letterSpacing: 1.5,
    marginBottom: LMN8Spacing.sm,
  },

  reflectionText: {
    ...LMN8Typography.h3,
    fontSize: 22,
    fontWeight: '300',
    color: LMN8Colors.text100,
    lineHeight: 32,
    fontStyle: 'italic',
  },

  warningCard: {
    marginBottom: LMN8Spacing.xxl,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    borderRadius: 16,
    padding: LMN8Spacing.lg,
  },

  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.sm,
    marginBottom: LMN8Spacing.sm,
  },

  warningTitle: {
    ...LMN8Typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#fcd34d',
    flex: 1,
  },

  warningText: {
    ...LMN8Typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: LMN8Colors.text85,
    marginBottom: LMN8Spacing.md,
  },

  warningCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: LMN8Spacing.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.24)',
    paddingHorizontal: LMN8Spacing.md,
    paddingVertical: LMN8Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },

  warningCTAText: {
    ...LMN8Typography.button,
    fontSize: 13,
    color: LMN8Colors.text100,
  },

  summaryAccessCard: {
    marginBottom: LMN8Spacing.xxl,
    borderRadius: 16,
    overflow: 'hidden',
  },

  summaryAccessGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentSecondary}35`,
    padding: LMN8Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: LMN8Spacing.md,
  },

  homeworkAccessGradient: {
    borderColor: `${LMN8Colors.accentPrimary}35`,
  },

  homeworkAccessIcon: {
    backgroundColor: `${LMN8Colors.accentPrimary}22`,
  },
  summaryAccessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.md,
    flex: 1,
  },

  summaryAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${LMN8Colors.accentSecondary}22`,
  },

  summaryAccessTextWrap: {
    flex: 1,
  },

  summaryAccessTitle: {
    ...LMN8Typography.body,
    color: LMN8Colors.text100,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },

  summaryAccessText: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text85,
    fontSize: 12,
    lineHeight: 17,
  },

  // Progress Section - Encouraging and growth-oriented
  progressSection: {
    marginBottom: LMN8Spacing.xxl,
  },

  sectionHeader: {
    marginBottom: LMN8Spacing.lg,
  },

  // Streak Section
  streakSection: {
    marginBottom: LMN8Spacing.xxl,
  },

  streakCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },

  streakGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f59e0b30',
  },

  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LMN8Spacing.lg,
  },

  streakIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f59e0b15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.md,
  },

  streakTextContainer: {
    flex: 1,
  },

  streakNumber: {
    ...LMN8Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: '#f59e0b',
    marginBottom: 2,
  },

  streakLabel: {
    ...LMN8Typography.body,
    fontSize: 14,
    fontWeight: '500',
    color: LMN8Colors.text85,
  },

  streakInfoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${LMN8Colors.container}80`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Milestones Section
  milestonesSection: {
    marginBottom: LMN8Spacing.xxl,
  },

  milestonesScrollContent: {
    paddingRight: LMN8Spacing.xl,
    marginBottom: LMN8Spacing.lg,
  },

  nextMilestoneCard: {
    backgroundColor: `${LMN8Colors.container}90`,
    borderRadius: 16,
    padding: LMN8Spacing.lg,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}15`,
  },

  nextMilestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LMN8Spacing.sm,
  },

  nextMilestoneTitle: {
    ...LMN8Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: LMN8Colors.text100,
  },

  nextMilestoneProgress: {
    ...LMN8Typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#f59e0b',
  },

  progressBarContainer: {
    marginBottom: LMN8Spacing.sm,
  },

  progressBarBackground: {
    height: 8,
    backgroundColor: `${LMN8Colors.text60}20`,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  nextMilestoneDescription: {
    ...LMN8Typography.caption,
    fontSize: 12,
    color: LMN8Colors.text60,
    lineHeight: 16,
  },

  // Journey Theme Section
  journeyThemeSection: {
    marginBottom: LMN8Spacing.xxl,
  },

  sectionTitle: {
    ...LMN8Typography.h2,
    fontSize: 22,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.xs,
  },

  sectionSubtitle: {
    ...LMN8Typography.body,
    fontSize: 14,
    fontWeight: '300',
    color: LMN8Colors.text60,
    letterSpacing: 0.3,
  },

  progressCards: {
    flexDirection: 'row',
    gap: LMN8Spacing.md,
  },

  progressCard: {
    flex: 1,
    backgroundColor: `${LMN8Colors.container}95`,
    borderRadius: 18,
    padding: LMN8Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}15`,
  },

  progressIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${LMN8Colors.accentPrimary}12`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LMN8Spacing.md,
  },

  progressNumber: {
    ...LMN8Typography.h2,
    fontSize: 28,
    fontWeight: '600',
    color: LMN8Colors.accentPrimary,
    marginBottom: LMN8Spacing.xs,
  },

  progressLabel: {
    ...LMN8Typography.caption,
    fontSize: 11,
    fontWeight: '500',
    color: LMN8Colors.text85,
    textAlign: 'center',
    lineHeight: 14,
  },

  // Therapeutic Actions - Gentle call to actions
  therapeuticActions: {
    marginBottom: LMN8Spacing.xxl,
  },

  primaryActionCard: {
    marginBottom: LMN8Spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },

  actionGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}20`,
  },

  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: LMN8Spacing.lg,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  actionIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${LMN8Colors.bgDark}80`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.md,
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitleLarge: {
    ...LMN8Typography.h3,
    fontSize: 18,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.xs,
  },

  actionDescriptionLarge: {
    ...LMN8Typography.body,
    fontSize: 13,
    fontWeight: '300',
    color: LMN8Colors.text85,
    letterSpacing: 0.2,
  },

  secondaryActions: {
    flexDirection: 'row',
    gap: LMN8Spacing.md,
    marginTop: LMN8Spacing.md,
  },

  secondaryActionCard: {
    flex: 1,
    backgroundColor: `${LMN8Colors.container}90`,
    borderRadius: 16,
    padding: LMN8Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}15`,
  },

  secondaryActionText: {
    ...LMN8Typography.body,
    fontSize: 13,
    fontWeight: '500',
    color: LMN8Colors.text100,
    marginTop: LMN8Spacing.sm,
    textAlign: 'center',
  },

  // Safe Space Card - Reinforcing belonging and safety
  safeSpaceCard: {
    backgroundColor: `${LMN8Colors.container}85`,
    borderRadius: 20,
    padding: LMN8Spacing.lg,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}12`,
    marginBottom: LMN8Spacing.xl,
  },

  safeSpaceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${LMN8Colors.accentPrimary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.md,
  },

  safeSpaceTextContainer: {
    flex: 1,
  },

  safeSpaceTitle: {
    ...LMN8Typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.xs,
  },

  safeSpaceText: {
    ...LMN8Typography.body,
    fontSize: 13,
    fontWeight: '300',
    color: LMN8Colors.text85,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
});
