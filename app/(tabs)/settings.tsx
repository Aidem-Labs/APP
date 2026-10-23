import { CrisisInterventionModal } from '@/components/CrisisInterventionModal';
import { JourneyThemeCard } from '@/components/JourneyThemeCard';
import PasswordResetModal from '@/components/PasswordResetModal';
import { LMN8Button } from '@/components/ui/LMN8Button';
import { VoiceStressSettings } from '@/components/VoiceStressSettings';
import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useVoiceStress } from '@/contexts/VoiceStressContext';
import { clinicianSharingAPI, ClinicianSharingPreferences, dataPrivacyAPI } from '@/services/APIService';
import { databaseService } from '@/services/DatabaseService';
import { createPrivacyExportPdf } from '@/services/PrivacyDataService';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { onboardingData, clearOnboardingData } = useOnboarding();
  const { 
    isEnabled, 
    showCrisisModal, 
    currentStressLevel,
    enableMonitoring, 
    disableMonitoring,
    dismissCrisisModal,
    callEmergency,
    startBreathingExercise,
    talkToGuide
  } = useVoiceStress();
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(true);
  const [isPreferencesSaving, setIsPreferencesSaving] = useState(false);
  const [clinicianSharingPreferences, setClinicianSharingPreferences] = useState<ClinicianSharingPreferences>({
    shareAIConversationSummary: true,
    shareJournalEntrySummary: true,
  });
  const [journalAiConsent, setJournalAiConsent] = useState(true);
  const [isDataActionRunning, setIsDataActionRunning] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Profile',
      'This will clear your profile data and take you through onboarding again. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            clearOnboardingData();
            router.replace('/onboarding-selection');
          }
        },
      ]
    );
  };

  // Data deletion: clears only this signed-in user after the server confirms deletion.
  const finishAccountDeletion = async () => {
    const currentUserId = user?.id;
    if (currentUserId) {
      await databaseService.clearUserData(currentUserId).catch((error) =>
        console.warn('Could not clear scoped local data:', error)
      );
    }
    await AsyncStorage.multiRemove(['journal_ai_consent', 'chat_sessions_v1']);
    clearOnboardingData();
    await logout();
    router.replace('/login');
  };

  const deleteMyData = async () => {
    setIsDataActionRunning(true);
    try {
      const response = await dataPrivacyAPI.deleteAccount();
      if (!response.success) throw new Error(response.error || 'Deletion request failed');
      await finishAccountDeletion();
      Alert.alert('Data Deleted', 'Your account and personal data have been permanently deleted.');
    } catch (error) {
      console.error('Account deletion failed:', error);
      Alert.alert('Deletion Failed', 'We could not complete deletion. Please try again later or contact support.');
    } finally {
      setIsDataActionRunning(false);
    }
  };

  const handleExportAndDelete = () => {
    Alert.alert(
      'Download & Delete My Data',
      'We will create a PDF on this device, open the save/share sheet, then permanently delete your account and personal data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download & Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const exportResponse = await dataPrivacyAPI.exportData();
              const exportData = exportResponse.data?.data;
              if (!exportResponse.success || !exportData) throw new Error(exportResponse.error || 'Export request failed');
              await createPrivacyExportPdf(exportData);
              await deleteMyData();
            } catch (error) {
              console.error('Export and deletion failed:', error);
              Alert.alert('Export Failed', 'Your data was not deleted. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteMyData = () => {
    Alert.alert(
      'Delete My Data',
      'This permanently deletes your signed-in account, email, profile, journal entries, summaries, AI conversations and related records.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete My Data', style: 'destructive', onPress: deleteMyData },
      ]
    );
  };

  const loadClinicianSharingPreferences = async () => {
    try {
      setIsPreferencesLoading(true);
      const response = await clinicianSharingAPI.getPreferences();

      if (response.success && response.data) {
        const d = response.data.data || response.data;
        setClinicianSharingPreferences({
          shareAIConversationSummary: d.shareAIConversationSummary ?? d.share_ai_conversation_summary ?? true,
          shareJournalEntrySummary: d.shareJournalEntrySummary ?? d.share_journal_entry_summary ?? true,
        });
      } else if (response.status !== 401) {
        console.error('Failed to load clinician-sharing preferences:', response.error);
        Alert.alert('Notice', 'Could not load sharing preferences. Using defaults.');
      }
    } catch (error) {
      console.error('Failed to load clinician-sharing preferences:', error);
      Alert.alert('Notice', 'Could not load sharing preferences. Using defaults.');
    } finally {
      setIsPreferencesLoading(false);
    }
  };

  const handleClinicianPreferenceToggle = async (
    key: keyof ClinicianSharingPreferences,
    value: boolean
  ) => {
    const previousPreferences = clinicianSharingPreferences;
    const updatedPreferences = {
      ...previousPreferences,
      [key]: value,
    };

    setClinicianSharingPreferences(updatedPreferences);
    try {
      setIsPreferencesSaving(true);
      const response = await clinicianSharingAPI.updatePreferences(updatedPreferences);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update preferences');
      }
      if (response.data?.data) {
        const d = response.data.data;
        setClinicianSharingPreferences({
          shareAIConversationSummary: d.shareAIConversationSummary ?? d.share_ai_conversation_summary ?? value,
          shareJournalEntrySummary: d.shareJournalEntrySummary ?? d.share_journal_entry_summary ?? value,
        });
      }
    } catch (error) {
      console.error('Failed to update clinician-sharing preference:', error);
      setClinicianSharingPreferences(previousPreferences);
      Alert.alert('Update Failed', 'Could not update this preference. Please try again.');
    } finally {
      setIsPreferencesSaving(false);
    }
  };

  const handlePasswordReset = () => {
    setShowPasswordResetModal(true);
  };

  const handleJournalAiConsentToggle = async (value: boolean) => {
    setJournalAiConsent(value);
    await AsyncStorage.setItem('journal_ai_consent', value ? 'true' : 'false');
  };

  const loadJournalAiConsent = async () => {
    const stored = await AsyncStorage.getItem('journal_ai_consent');
    setJournalAiConsent(stored !== 'false');
  };

  useFocusEffect(
    useCallback(() => {
      loadClinicianSharingPreferences();
      loadJournalAiConsent();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Background with gradient overlay */}
      <LinearGradient
        colors={[
          LMN8Colors.bgDark,
          '#1e1e3f',
          LMN8Colors.bgDark,
          '#2a1a4e',
          LMN8Colors.bgDark
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating background elements */}
      <View style={styles.floatingElement1} />
      <View style={styles.floatingElement2} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.sectionCard}>
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <Text style={styles.profileStatus}>Profile Complete</Text>
              </View>
            </View>

            {/* Reset Password - COMMENTED OUT: no backend */}
            {/* <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingItem} onPress={handlePasswordReset}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Reset Password</Text>
                <Text style={styles.settingDescription}>Change your account password</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Voice Stress Monitoring Section - COMMENTED OUT: no AI model deployed */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mental Health Support</Text>
          <VoiceStressSettings 
            onToggle={(enabled) => enabled ? enableMonitoring() : disableMonitoring()}
            isEnabled={isEnabled}
          />
        </View> */}

        {/* Apple Watch Integration Section - COMMENTED OUT: no backend endpoint */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tracking</Text>
          <AppleWatchSettings />
        </View> */}

        {/* Journey Themes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey Customization</Text>
          <JourneyThemeCard />
        </View>

        {/* Preferences Section - COMMENTED OUT: toggles non-functional */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Get reminders and updates</Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: LMN8Colors.text60, true: LMN8Colors.accentPrimary }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Always use dark theme</Text>
              </View>
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: LMN8Colors.text60, true: LMN8Colors.accentPrimary }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.settingDivider} />
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Privacy Settings</Text>
                <Text style={styles.settingDescription}>Manage sharing preferences below</Text>
              </View>
            </View>
          </View>
        </View> */}

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Allow AI to read my journal entries</Text>
                <Text style={styles.settingDescription}>
                  When ON, the AI can read your journal entries for better context. When OFF, the AI won't see any of your entries.
                </Text>
              </View>
              <Switch
                value={journalAiConsent}
                onValueChange={handleJournalAiConsentToggle}
                trackColor={{ false: LMN8Colors.text60, true: LMN8Colors.accentPrimary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Clinician Sharing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinician Sharing</Text>
          <View style={styles.sectionCard}>
            <View style={styles.infoNotice}>
              <Text style={styles.infoNoticeTitle}>Share Progress Summaries with Your Clinician</Text>
              <Text style={styles.infoNoticeText}>
                These settings help your clinician understand how you are improving over time.
                Only summaries are shared. Word-for-word conversations are not shared.
              </Text>
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>AI Conversation Summary</Text>
                <Text style={styles.settingDescription}>
                  Share summary insights from your AI chats with your clinician
                </Text>
              </View>
              <Switch
                value={clinicianSharingPreferences.shareAIConversationSummary}
                onValueChange={(value) => handleClinicianPreferenceToggle('shareAIConversationSummary', value)}
                trackColor={{ false: LMN8Colors.text60, true: LMN8Colors.accentPrimary }}
                thumbColor="#ffffff"
                disabled={isPreferencesLoading || isPreferencesSaving}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Journal Entry Summary</Text>
                <Text style={styles.settingDescription}>
                  Share summary insights from your journal entries with your clinician
                </Text>
              </View>
              <Switch
                value={clinicianSharingPreferences.shareJournalEntrySummary}
                onValueChange={(value) => handleClinicianPreferenceToggle('shareJournalEntrySummary', value)}
                trackColor={{ false: LMN8Colors.text60, true: LMN8Colors.accentPrimary }}
                thumbColor="#ffffff"
                disabled={isPreferencesLoading || isPreferencesSaving}
              />
            </View>
          </View>
        </View>

        {/* Data deletion and export controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleExportAndDelete}
              disabled={isDataActionRunning}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Download & Delete My Data</Text>
                <Text style={styles.settingDescription}>Save a PDF to this device, then permanently delete only your data</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDeleteMyData}
              disabled={isDataActionRunning}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Delete My Data</Text>
                <Text style={styles.settingDescription}>Permanently delete your account and personal records</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.settingDivider} />
            <TouchableOpacity style={styles.settingItem} onPress={handleResetOnboarding} disabled={isDataActionRunning}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Reset Profile</Text>
                <Text style={styles.settingDescription}>Start over with onboarding</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Build</Text>
              <Text style={styles.settingValue}>2024.1</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <LMN8Button
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            size="large"
            fullWidth
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>METAT8</Text>
          <Text style={styles.appDescription}>
            Your AI companion for personal growth and therapeutic support
          </Text>
        </View>
      </ScrollView>

      <Modal visible={isDataActionRunning} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.deletionOverlay}>
          <View style={styles.deletionLoaderCard}>
            <ActivityIndicator size="large" color={LMN8Colors.accentPrimary} />
            <Text style={styles.deletionLoaderTitle}>Deleting your data…</Text>
            <Text style={styles.deletionLoaderText}>Please keep the app open while we securely complete this request.</Text>
          </View>
        </View>
      </Modal>
      {/* Password Reset Modal */}
      <PasswordResetModal
        visible={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        userEmail={user?.email || ''}
      />

      {/* Crisis Intervention Modal */}
      <CrisisInterventionModal
        visible={showCrisisModal}
        stressLevel={currentStressLevel}
        onClose={dismissCrisisModal}
        onCallEmergency={callEmergency}
        onStartBreathing={startBreathingExercise}
        onTalkToGuide={talkToGuide}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LMN8Colors.bgDark,
  },

  deletionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 10, 24, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: LMN8Spacing.xl,
  },

  deletionLoaderCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 18,
    padding: LMN8Spacing.xl,
    alignItems: 'center',
    backgroundColor: LMN8Colors.container,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}55`,
  },

  deletionLoaderTitle: {
    ...LMN8Typography.h3,
    color: LMN8Colors.text100,
    marginTop: LMN8Spacing.lg,
    marginBottom: LMN8Spacing.sm,
  },

  deletionLoaderText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 100, // Extra padding for tab bar
  },

  floatingElement1: {
    position: 'absolute',
    top: height * 0.1,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${LMN8Colors.accentPrimary}06`,
    opacity: 0.4,
  },

  floatingElement2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: `${LMN8Colors.accentPrimary}04`,
    opacity: 0.3,
  },

  header: {
    padding: LMN8Spacing.xl,
    paddingTop: 50, // Account for status bar
    alignItems: 'center',
  },

  title: {
    ...LMN8Typography.h1,
    fontSize: 32,
    fontWeight: '800',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.sm,
  },

  subtitle: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
    fontSize: 16,
    textAlign: 'center',
  },

  section: {
    marginBottom: LMN8Spacing.xl,
    paddingHorizontal: LMN8Spacing.lg,
  },

  sectionTitle: {
    ...LMN8Typography.h3,
    fontSize: 18,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.md,
  },

  sectionCard: {
    backgroundColor: `${LMN8Colors.container}98`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}20`,
    overflow: 'hidden',
  },

  infoNotice: {
    backgroundColor: `${LMN8Colors.accentPrimary}10`,
    paddingHorizontal: LMN8Spacing.lg,
    paddingVertical: LMN8Spacing.md,
  },

  infoNoticeTitle: {
    ...LMN8Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: 6,
  },

  infoNoticeText: {
    ...LMN8Typography.caption,
    fontSize: 12,
    lineHeight: 18,
    color: LMN8Colors.text85,
  },

  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LMN8Spacing.lg,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: LMN8Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.md,
  },

  avatarText: {
    ...LMN8Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },

  profileDetails: {
    flex: 1,
  },

  profileEmail: {
    ...LMN8Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: 4,
  },

  profileStatus: {
    ...LMN8Typography.caption,
    color: LMN8Colors.accentPrimary,
    fontSize: 12,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LMN8Spacing.lg,
    paddingVertical: LMN8Spacing.md,
  },

  settingInfo: {
    flex: 1,
  },

  settingTitle: {
    ...LMN8Typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: LMN8Colors.text100,
    marginBottom: 2,
  },

  settingDescription: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text60,
    fontSize: 12,
  },

  settingValue: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text60,
    fontSize: 14,
  },

  settingArrow: {
    ...LMN8Typography.h2,
    fontSize: 20,
    color: LMN8Colors.text60,
    marginLeft: LMN8Spacing.sm,
  },

  settingDivider: {
    height: 1,
    backgroundColor: `${LMN8Colors.accentPrimary}10`,
    marginLeft: LMN8Spacing.lg,
  },

  dangerText: {
    color: '#ff6b6b',
  },

  logoutSection: {
    paddingHorizontal: LMN8Spacing.lg,
    marginBottom: LMN8Spacing.xl,
  },

  appInfo: {
    alignItems: 'center',
    paddingHorizontal: LMN8Spacing.lg,
    paddingBottom: LMN8Spacing.xl,
  },

  appName: {
    ...LMN8Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: LMN8Colors.accentPrimary,
    marginBottom: LMN8Spacing.sm,
  },

  appDescription: {
    ...LMN8Typography.body,
    color: LMN8Colors.text60,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
