import { LMN8BorderRadius, LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OnboardingSelectionScreen() {
  const handleFullTrack = () => {
    router.push('/onboarding-full');
  };

  const handleFastTrack = () => {
    router.push('/onboarding-fast');
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

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
           {/* Header */}
           <View style={styles.header}>
             <View style={styles.logoWrapper}>
               <Text style={styles.logo}>METAT8</Text>
               <View style={styles.logoUnderline} />
             </View>
             <Text style={styles.title}>Design Your AI Companion</Text>
             <Text style={styles.subtitle}>
               Choose how you'd like to personalize your support experience
             </Text>
           </View>

        {/* Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Full-Track Card */}
          <TouchableOpacity style={styles.card} onPress={handleFullTrack}>
            <View style={styles.cardGradient}>
              <View style={styles.cardAccent} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Full-Track</Text>
                  <Text style={styles.cardSubtitle}>Comprehensive Personalization</Text>
                </View>
                
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🎯</Text>
                    <Text style={styles.featureText}>14 detailed questions</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>💭</Text>
                    <Text style={styles.featureText}>Deep conversation about your inner world</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🌟</Text>
                    <Text style={styles.featureText}>Highly personalized companion</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>⏱️</Text>
                    <Text style={styles.featureText}>Takes 10-15 minutes</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.recommendedText}>Recommended for best results</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Fast-Track Card */}
          <TouchableOpacity style={styles.card} onPress={handleFastTrack}>
            <View style={styles.cardGradient}>
              <View style={styles.cardAccent} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Fast-Track</Text>
                  <Text style={styles.cardSubtitle}>Quick & Essential</Text>
                </View>
                
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>⚡</Text>
                    <Text style={styles.featureText}>8 focused questions</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🎨</Text>
                    <Text style={styles.featureText}>Core personality & style</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🚀</Text>
                    <Text style={styles.featureText}>Get started quickly</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>⏱️</Text>
                    <Text style={styles.featureText}>Takes 3-5 minutes</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.quickText}>Perfect for getting started</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <BlurView intensity={10} tint="dark" style={styles.privacyBlur}>
              <Text style={styles.privacyText}>
                🔒 Your responses are encrypted and stored locally. You can always come back to complete the full experience later.
              </Text>
            </BlurView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LMN8Colors.bgDark,
  },
  
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },

  content: {
    flex: 1,
    padding: LMN8Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    paddingBottom: height * 0.05,
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
     marginBottom: height < 700 ? LMN8Spacing.lg : LMN8Spacing.xl,
   },

  logoWrapper: {
    alignItems: 'center',
    marginBottom: LMN8Spacing.md,
  },

  logo: {
    fontSize: height < 700 ? 36 : 42,
    fontWeight: '900',
    color: LMN8Colors.text100,
    letterSpacing: 3,
    textShadowColor: `${LMN8Colors.accentPrimary}40`,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },

  logoUnderline: {
    width: height < 700 ? 50 : 60,
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
    fontSize: height < 700 ? 28 : 32,
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
    fontSize: height < 700 ? 14 : 16,
    textAlign: 'center',
    color: LMN8Colors.text85,
    lineHeight: height < 700 ? 20 : 24,
    fontWeight: '400',
    opacity: 0.9,
    paddingHorizontal: LMN8Spacing.sm,
  },

  cardsContainer: {
    gap: height < 700 ? LMN8Spacing.md : LMN8Spacing.lg,
    marginBottom: height < 700 ? LMN8Spacing.lg : LMN8Spacing.xl,
  },

  card: {
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
    padding: height < 700 ? LMN8Spacing.lg : LMN8Spacing.xl,
    position: 'relative',
    zIndex: 2,
  },

  cardHeader: {
    marginBottom: height < 700 ? LMN8Spacing.md : LMN8Spacing.lg,
    paddingBottom: LMN8Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${LMN8Colors.accentPrimary}10`,
  },

  cardTitle: {
    ...LMN8Typography.h2,
    fontSize: height < 700 ? 20 : 24,
    fontWeight: '700',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.xs,
  },

  cardSubtitle: {
    ...LMN8Typography.body,
    fontSize: height < 700 ? 14 : 16,
    color: LMN8Colors.text85,
    fontWeight: '500',
  },

  featuresList: {
    marginBottom: height < 700 ? LMN8Spacing.md : LMN8Spacing.lg,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height < 700 ? LMN8Spacing.xs : LMN8Spacing.sm,
  },

  featureIcon: {
    fontSize: height < 700 ? 18 : 20,
    marginRight: LMN8Spacing.sm,
    width: 24,
  },

  featureText: {
    ...LMN8Typography.body,
    fontSize: height < 700 ? 13 : 14,
    color: LMN8Colors.text85,
    flex: 1,
  },

  cardFooter: {
    alignItems: 'center',
  },

  recommendedText: {
    ...LMN8Typography.caption,
    fontSize: 12,
    color: LMN8Colors.accentPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },

  quickText: {
    ...LMN8Typography.caption,
    fontSize: 12,
    color: LMN8Colors.text60,
    fontWeight: '500',
    textAlign: 'center',
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
