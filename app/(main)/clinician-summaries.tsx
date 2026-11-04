import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { clinicianSharingAPI, ClinicianSummary, ClinicianSummaryType } from '@/services/APIService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');
const PAGE_SIZE = 20;

export default function ClinicianSummariesScreen() {
  const router = useRouter();
  const [summaries, setSummaries] = useState<ClinicianSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [summaryType, setSummaryType] = useState<ClinicianSummaryType>('ai_conversation');

  const loadSummaries = async (reset = false, typeOverride?: ClinicianSummaryType) => {
    const currentOffset = reset ? 0 : offset;
    const selectedSummaryType = typeOverride || summaryType;
    try {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);

      const response = await clinicianSharingAPI.getSummaries(selectedSummaryType, PAGE_SIZE, currentOffset);
      if (response.success && response.data) {
        const incoming = response.data.data || [];
        setSummaries((prev) => (reset ? incoming : [...prev, ...incoming]));
        setOffset(currentOffset + incoming.length);
        setHasMore(incoming.length === PAGE_SIZE);
      } else {
        if (reset) setSummaries([]);
      }
    } catch {
      if (reset) setSummaries([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSummaries(true, summaryType);
    }, [summaryType])
  );

  const handleTypeChange = (nextType: ClinicianSummaryType) => {
    if (nextType === summaryType) return;
    setSummaryType(nextType);
    setOffset(0);
    setHasMore(true);
    setSummaries([]);
    loadSummaries(true, nextType);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LMN8Colors.accentPrimary} />
        <Text style={styles.loadingText}>Loading summaries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[LMN8Colors.bgDark, '#edf2f2', LMN8Colors.bgDark]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.floatingElement} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={LMN8Colors.text85} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>AI Conversation Summaries</Text>
            <Text style={styles.subtitle}>
              These are high-level summaries to help your clinician track your progress.
            </Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              summaryType === 'ai_conversation' && styles.filterChipActive,
            ]}
            onPress={() => handleTypeChange('ai_conversation')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                summaryType === 'ai_conversation' && styles.filterChipTextActive,
              ]}
            >
              AI Conversation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              summaryType === 'journal_entry' && styles.filterChipActive,
            ]}
            onPress={() => handleTypeChange('journal_entry')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                summaryType === 'journal_entry' && styles.filterChipTextActive,
              ]}
            >
              Journal Entry
            </Text>
          </TouchableOpacity>
        </View>

        {summaries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={28} color={LMN8Colors.text60} />
            <Text style={styles.emptyTitle}>No summaries yet</Text>
            <Text style={styles.emptyText}>
              {summaryType === 'journal_entry'
                ? 'Create journal entries to generate a behavioral summary.'
                : 'When summaries are generated, they will appear here.'}
            </Text>
          </View>
        ) : (
          summaries.map((item) => (
            <View key={item.id} style={styles.summaryCard}>
              <Text style={styles.summaryText}>{item.summaryText}</Text>
            </View>
          ))
        )}
        {hasMore && summaries.length > 0 && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            disabled={isLoadingMore}
            onPress={() => loadSummaries(false)}
          >
            {isLoadingMore ? (
              <ActivityIndicator size="small" color={LMN8Colors.text100} />
            ) : (
              <Text style={styles.loadMoreText}>Load More</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LMN8Colors.bgDark,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LMN8Colors.bgDark,
  },
  loadingText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
    marginTop: LMN8Spacing.md,
  },
  floatingElement: {
    position: 'absolute',
    top: height * 0.14,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: `${LMN8Colors.accentPrimary}08`,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LMN8Spacing.xl,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    marginBottom: LMN8Spacing.xl,
    gap: LMN8Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${LMN8Colors.container}90`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: LMN8Spacing.sm,
    marginBottom: LMN8Spacing.lg,
  },
  filterChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}30`,
    backgroundColor: `${LMN8Colors.container}92`,
    paddingVertical: LMN8Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: `${LMN8Colors.accentPrimary}65`,
    backgroundColor: `${LMN8Colors.accentPrimary}22`,
  },
  filterChipText: {
    ...LMN8Typography.metadata,
    color: LMN8Colors.text85,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: LMN8Colors.text100,
  },
  title: {
    ...LMN8Typography.h2,
    fontSize: 24,
    lineHeight: 28,
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.xs,
  },
  subtitle: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
    fontSize: 13,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: `${LMN8Colors.container}96`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}20`,
    padding: LMN8Spacing.lg,
    marginBottom: LMN8Spacing.md,
  },
  summaryText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text100,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: LMN8Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: `${LMN8Colors.container}92`,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}15`,
    padding: LMN8Spacing.xl,
    gap: LMN8Spacing.sm,
  },
  emptyTitle: {
    ...LMN8Typography.h3,
    fontSize: 18,
    color: LMN8Colors.text100,
  },
  emptyText: {
    ...LMN8Typography.body,
    fontSize: 13,
    color: LMN8Colors.text60,
    textAlign: 'center',
  },
  loadMoreButton: {
    marginTop: LMN8Spacing.md,
    backgroundColor: `${LMN8Colors.accentPrimary}30`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}50`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LMN8Spacing.md,
  },
  loadMoreText: {
    ...LMN8Typography.button,
    color: LMN8Colors.text100,
  },
});
