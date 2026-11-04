import { LMN8Colors, LMN8Spacing } from '@/constants/LMN8DesignSystem';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export const LMN8SplashScreen: React.FC = () => {
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateGlow = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animateGlow();
  }, [glowAnimation]);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logoGlow, { opacity: glowOpacity }]}>
          <Text style={styles.logo}>8</Text>
        </Animated.View>
        <Text style={styles.logoText}>METAT8</Text>
        <Text style={styles.tagline}>Your Sacred Space</Text>
      </View>
      
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LMN8Colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: LMN8Spacing.xl,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: LMN8Spacing.xxl,
  },
  
  logoGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: LMN8Colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LMN8Spacing.lg,
    shadowColor: LMN8Colors.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  
  logo: {
    fontSize: 72,
    fontWeight: 'bold',
    color: LMN8Colors.bgDark,
  },
  
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.sm,
  },
  
  tagline: {
    fontSize: 18,
    color: LMN8Colors.text85,
    textAlign: 'center',
  },
  
  loadingContainer: {
    alignItems: 'center',
  },
  
  loadingDots: {
    flexDirection: 'row',
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
    opacity: 0.3,
  },
  
  dot2: {
    opacity: 0.6,
  },
  
  dot3: {
    opacity: 1,
  },
});
