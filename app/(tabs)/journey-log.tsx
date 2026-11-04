import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { JournalEntry as APIJournalEntry, journalAPI } from '@/services/APIService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface JourneyEntry {
  id: string;
  title: string;
  content: string;
  mediaType: 'text' | 'photo' | 'handwritten' | 'voice';
  mediaUrl?: string;
  transcribedText?: string;
  timestamp: string;
  mood?: number;
}

const ENTRIES_PER_PAGE = 5;

export default function JourneyLogScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Refetch entries every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Journey log screen focused - loading entries...');
      loadEntries(1);
    }, [])
  );

  const loadEntries = async (page = 1) => {
    try {
      setIsLoading(true);
      console.log('📖 Loading journal entries from API...');
      
      // Fetch a paginated page from the API
      const response = await journalAPI.getEntries(page, ENTRIES_PER_PAGE);
      
      if (response.success && response.data) {
        console.log('✅ Journal entries loaded successfully:', response.data);
        
        // Map API entries to our local format
        const apiEntries = response.data.data || [];
        const mappedEntries: JourneyEntry[] = apiEntries.map((entry: APIJournalEntry) => ({
          id: entry.id || '',
          title: entry.title,
          content: entry.content,
          mediaType: entry.mediaType,
          mediaUrl: entry.mediaUrl,
          transcribedText: entry.transcribedText,
          timestamp: entry.createdAt || entry.timestamp || new Date().toISOString(),
          mood: entry.mood,
        }));
        
        setEntries(mappedEntries);
        const pagination = response.data.pagination;
        setCurrentPage(pagination?.page || page);
        setTotalPages(pagination?.totalPages || 1);
        setTotalEntries(pagination?.total || mappedEntries.length);
        console.log(`📊 Loaded ${mappedEntries.length} journal entries`);
      } else {
        if (response.status !== 401) {
          console.error('❌ Failed to load entries:', response.error);
          Alert.alert('Error', response.error || 'Failed to load your journey entries');
        }
        setEntries([]); // Set empty array on error
        setTotalEntries(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('❌ Exception while loading entries:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading your entries');
      setEntries([]); // Set empty array on error
      setTotalEntries(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewEntry = () => {
    router.push('/(main)/new-entry');
  };

  const handleEntryPress = (entry: JourneyEntry) => {
    router.push({
      pathname: '/(main)/entry-detail',
      params: { entryId: entry.id }
    });
  };
  

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadEntries(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      loadEntries(currentPage + 1);
    }
  };

  const getMediaTypeIcon = (mediaType: string): keyof typeof Ionicons.glyphMap => {
    switch (mediaType) {
      case 'text': return 'document-text-outline';
      case 'photo': return 'image-outline';
      case 'handwritten': return 'brush-outline';
      case 'voice': return 'mic-outline';
      default: return 'document-outline';
    }
  };

  const getMediaTypeLabel = (mediaType: string) => {
    switch (mediaType) {
      case 'text': return 'Written';
      case 'photo': return 'Visual';
      case 'handwritten': return 'Handwritten';
      case 'voice': return 'Voice Memo';
      default: return 'Entry';
    }
  };

  const getMediaTypeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'text': return LMN8Colors.accentPrimary;
      case 'photo': return LMN8Colors.accentSecondary;
      case 'handwritten': return LMN8Colors.accentHighlight;
      case 'voice': return '#f472b6';
      default: return LMN8Colors.accentPrimary;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Compare actual calendar days, not just time difference
    const dateDay = date.getDate();
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    
    const nowDay = now.getDate();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();
    
    // Check if it's the same day
    if (dateDay === nowDay && dateMonth === nowMonth && dateYear === nowYear) {
      return 'Today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateDay === yesterday.getDate() && 
        dateMonth === yesterday.getMonth() && 
        dateYear === yesterday.getFullYear()) {
      return 'Yesterday';
    }
    
    // Calculate difference in days
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getMoodIcon = (mood?: number): keyof typeof Ionicons.glyphMap => {
    if (!mood) return 'ellipse-outline';
    if (mood >= 8) return 'happy-outline';
    if (mood >= 6) return 'happy-outline';
    if (mood >= 4) return 'remove-outline';
    if (mood >= 2) return 'sad-outline';
    return 'sad-outline';
  };

  const getMoodColor = (mood?: number) => {
    if (!mood) return LMN8Colors.text60;
    if (mood >= 8) return '#4ade80'; // Green
    if (mood >= 6) return '#60a5fa'; // Blue
    if (mood >= 4) return '#fbbf24'; // Yellow
    if (mood >= 2) return '#fb923c'; // Orange
    return '#f87171'; // Red
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your journey...</Text>
      </View>
    );
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="book-outline" size={32} color={LMN8Colors.accentPrimary} />
          </View>
          <Text style={styles.title}>Your Journey</Text>
          <Text style={styles.subtitle}>
            Every entry is a step forward in your healing process
          </Text>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={[`${LMN8Colors.accentPrimary}15`, `${LMN8Colors.accentPrimary}08`]}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalEntries}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {entries.length > 0 ? formatDate(entries[0].timestamp) : '-'}
              </Text>
              <Text style={styles.statLabel}>Most Recent</Text>
            </View>
          </LinearGradient>
        </View>

        {/* New Entry Button */}
        <TouchableOpacity style={styles.newEntryButton} onPress={handleNewEntry}>
          <LinearGradient
            colors={[`${LMN8Colors.accentPrimary}30`, `${LMN8Colors.accentPrimary}20`]}
            style={styles.newEntryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.newEntryIconContainer}>
              <Ionicons name="add-circle-outline" size={28} color={LMN8Colors.accentPrimary} />
            </View>
            <View style={styles.newEntryTextContainer}>
              <Text style={styles.newEntryTitle}>Create New Entry</Text>
              <Text style={styles.newEntrySubtitle}>Capture this moment</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={LMN8Colors.text60} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Section Title */}
        {entries.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            <Text style={styles.sectionSubtitle}>Your documented moments</Text>
          </View>
        )}

        {/* Entries List or Empty State */}
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIconContainer}>
              <Ionicons name="journal-outline" size={72} color={`${LMN8Colors.accentPrimary}40`} />
            </View>
            <Text style={styles.emptyStateTitle}>Begin Your Journey</Text>
            <Text style={styles.emptyStateText}>
              Your first journal entry is the start of something meaningful. 
              Take a moment to reflect and document your thoughts.
            </Text>
            <TouchableOpacity style={styles.emptyStateCTA} onPress={handleNewEntry}>
              <Ionicons name="create-outline" size={20} color="#ffffff" />
              <Text style={styles.emptyStateCTAText}>Create First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => handleEntryPress(entry)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[`${LMN8Colors.container}98`, `${LMN8Colors.container}95`]}
                  style={styles.entryCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  {/* Entry Header */}
                  <View style={styles.entryHeader}>
                    <View style={styles.entryHeaderLeft}>
                      <View style={[
                        styles.mediaTypeIconContainer,
                        { backgroundColor: `${getMediaTypeColor(entry.mediaType)}15` }
                      ]}>
                        <Ionicons 
                          name={getMediaTypeIcon(entry.mediaType)} 
                          size={18} 
                          color={getMediaTypeColor(entry.mediaType)} 
                        />
                      </View>
                      <Text style={styles.mediaTypeLabel}>
                        {getMediaTypeLabel(entry.mediaType)}
                      </Text>
                    </View>
                    <Text style={styles.timestamp}>{formatDate(entry.timestamp)}</Text>
                  </View>

                  {/* Entry Title */}
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  
                  {/* Entry Content Preview */}
                  {entry.content && (
                    <Text style={styles.entryContent} numberOfLines={3}>
                      {entry.content}
                    </Text>
                  )}

                  {/* Transcribed Text (if any) */}
                  {entry.transcribedText && (
                    <View style={styles.transcribedContainer}>
                      <View style={styles.transcribedHeader}>
                        <Ionicons name="text-outline" size={14} color={LMN8Colors.accentSecondary} />
                        <Text style={styles.transcribedLabel}>Transcribed</Text>
                      </View>
                      <Text style={styles.transcribedText} numberOfLines={2}>
                        {entry.transcribedText}
                      </Text>
                    </View>
                  )}

                  {/* Entry Footer */}
                  <View style={styles.entryFooter}>
                    {entry.mood && (
                      <View style={styles.moodContainer}>
                        <View style={[
                          styles.moodIconContainer,
                          { backgroundColor: `${getMoodColor(entry.mood)}20` }
                        ]}>
                          <Ionicons 
                            name={getMoodIcon(entry.mood)} 
                            size={16} 
                            color={getMoodColor(entry.mood)} 
                          />
                        </View>
                        <Text style={styles.moodText}>
                          Mood: {entry.mood}/10
                        </Text>
                      </View>
                    )}
                    <View style={styles.viewMore}>
                      <Text style={styles.viewMoreText}>View Details</Text>
                      <Ionicons name="arrow-forward" size={14} color={LMN8Colors.text60} />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  (currentPage <= 1 || isLoading) && styles.paginationButtonDisabled,
                ]}
                onPress={handlePreviousPage}
                disabled={currentPage <= 1 || isLoading}
              >
                <Text style={styles.paginationButtonText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  (currentPage >= totalPages || isLoading) && styles.paginationButtonDisabled,
                ]}
                onPress={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
              >
                <Text style={styles.paginationButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LMN8Colors.bgDark,
  },

  loadingText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: LMN8Spacing.xl,
    paddingTop: 60,
  },

  // Floating background elements - calming
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

  // Header
  header: {
    alignItems: 'center',
    marginBottom: LMN8Spacing.xxl,
  },

  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${LMN8Colors.accentPrimary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LMN8Spacing.md,
  },

  title: {
    ...LMN8Typography.h1,
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: LMN8Spacing.sm,
    color: LMN8Colors.text100,
    letterSpacing: 0.3,
  },

  subtitle: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: LMN8Spacing.lg,
  },

  // Stats Summary Card
  statsCard: {
    marginBottom: LMN8Spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },

  statsGradient: {
    flexDirection: 'row',
    padding: LMN8Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}20`,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    ...LMN8Typography.h2,
    fontSize: 24,
    fontWeight: '600',
    color: LMN8Colors.accentPrimary,
    marginBottom: LMN8Spacing.xs,
  },

  statLabel: {
    ...LMN8Typography.caption,
    fontSize: 11,
    fontWeight: '500',
    color: LMN8Colors.text85,
    textAlign: 'center',
  },

  statDivider: {
    width: 1,
    backgroundColor: `${LMN8Colors.accentPrimary}20`,
    marginHorizontal: LMN8Spacing.md,
  },

  // New Entry Button
  newEntryButton: {
    marginBottom: LMN8Spacing.xxl,
    borderRadius: 20,
    overflow: 'hidden',
  },

  newEntryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LMN8Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}25`,
  },

  newEntryIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${LMN8Colors.bgDark}90`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.md,
  },

  newEntryTextContainer: {
    flex: 1,
  },

  newEntryTitle: {
    ...LMN8Typography.h3,
    fontSize: 17,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.xs / 2,
  },

  newEntrySubtitle: {
    ...LMN8Typography.body,
    fontSize: 13,
    fontWeight: '300',
    color: LMN8Colors.text85,
  },

  // Section Header
  sectionHeader: {
    marginBottom: LMN8Spacing.lg,
  },

  sectionTitle: {
    ...LMN8Typography.h2,
    fontSize: 20,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.xs,
  },

  sectionSubtitle: {
    ...LMN8Typography.body,
    fontSize: 13,
    fontWeight: '300',
    color: LMN8Colors.text85,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: LMN8Spacing.xxl,
    marginTop: LMN8Spacing.xxl,
  },

  emptyStateIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${LMN8Colors.accentPrimary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LMN8Spacing.xl,
  },

  emptyStateTitle: {
    ...LMN8Typography.h2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.md,
  },

  emptyStateText: {
    ...LMN8Typography.body,
    fontSize: 15,
    fontWeight: '300',
    textAlign: 'center',
    color: LMN8Colors.text85,
    marginBottom: LMN8Spacing.xl,
    lineHeight: 24,
    paddingHorizontal: LMN8Spacing.md,
  },

  emptyStateCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LMN8Colors.cta,
    paddingVertical: LMN8Spacing.md,
    paddingHorizontal: LMN8Spacing.xl,
    borderRadius: 16,
    gap: LMN8Spacing.sm,
  },

  emptyStateCTAText: {
    ...LMN8Typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Entry Cards
  entryCard: {
    marginBottom: LMN8Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },

  entryCardGradient: {
    padding: LMN8Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}15`,
  },

  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LMN8Spacing.md,
  },

  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mediaTypeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.sm,
  },

  mediaTypeLabel: {
    ...LMN8Typography.label,
    fontSize: 11,
    fontWeight: '600',
    color: LMN8Colors.text85,
    letterSpacing: 0.8,
  },

  timestamp: {
    ...LMN8Typography.metadata,
    fontSize: 12,
    color: LMN8Colors.text60,
  },

  entryTitle: {
    ...LMN8Typography.h3,
    fontSize: 19,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: LMN8Spacing.sm,
    lineHeight: 26,
  },

  entryContent: {
    ...LMN8Typography.body,
    fontSize: 14,
    fontWeight: '300',
    color: LMN8Colors.text85,
    lineHeight: 22,
    marginBottom: LMN8Spacing.md,
  },

  // Transcribed Text
  transcribedContainer: {
    backgroundColor: `${LMN8Colors.bgLight}60`,
    padding: LMN8Spacing.md,
    borderRadius: 12,
    marginBottom: LMN8Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: LMN8Colors.accentSecondary,
  },

  transcribedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LMN8Spacing.xs,
    gap: LMN8Spacing.xs,
  },

  transcribedLabel: {
    ...LMN8Typography.label,
    fontSize: 10,
    fontWeight: '600',
    color: LMN8Colors.accentSecondary,
    letterSpacing: 1,
  },

  transcribedText: {
    ...LMN8Typography.body,
    fontSize: 13,
    fontWeight: '300',
    color: LMN8Colors.text85,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Entry Footer
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: LMN8Spacing.sm,
  },

  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  moodIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.sm,
  },

  moodText: {
    ...LMN8Typography.metadata,
    fontSize: 12,
    fontWeight: '500',
    color: LMN8Colors.text85,
  },

  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.xs,
  },

  viewMoreText: {
    ...LMN8Typography.metadata,
    fontSize: 12,
    fontWeight: '500',
    color: LMN8Colors.text60,
  },

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: LMN8Spacing.lg,
    marginBottom: LMN8Spacing.md,
    gap: LMN8Spacing.md,
  },

  paginationButton: {
    backgroundColor: `${LMN8Colors.accentPrimary}22`,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}55`,
    borderRadius: 12,
    paddingVertical: LMN8Spacing.sm,
    paddingHorizontal: LMN8Spacing.lg,
    minWidth: 86,
    alignItems: 'center',
  },

  paginationButtonDisabled: {
    opacity: 0.45,
  },

  paginationButtonText: {
    ...LMN8Typography.button,
    color: LMN8Colors.text100,
    fontSize: 13,
  },

  paginationText: {
    ...LMN8Typography.metadata,
    color: LMN8Colors.text85,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },

  bottomPadding: {
    height: 100,
  },
});
