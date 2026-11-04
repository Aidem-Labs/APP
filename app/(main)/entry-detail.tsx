import { LMN8Button } from '@/components/ui/LMN8Button';
import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { JournalEntry as APIJournalEntry, journalAPI } from '@/services/APIService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
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

export default function EntryDetailScreen() {
  const router = useRouter();
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const [entry, setEntry] = useState<JourneyEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const normalizedEntryId = Array.isArray(entryId) ? entryId[0] : entryId;

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const mapAPIEntryToJourneyEntry = (apiEntry: APIJournalEntry): JourneyEntry => ({
    id: apiEntry.id || '',
    title: apiEntry.title || 'Untitled Entry',
    content: apiEntry.content || '',
    mediaType: apiEntry.mediaType || 'text',
    mediaUrl: apiEntry.mediaUrl,
    transcribedText: apiEntry.transcribedText,
    timestamp: apiEntry.createdAt || apiEntry.timestamp || new Date().toISOString(),
    mood: apiEntry.mood,
  });

  const loadEntry = async () => {
    setIsLoading(true);
    try {
      if (!normalizedEntryId) {
        setEntry(null);
        return;
      }

      const response = await journalAPI.getEntry(normalizedEntryId);
      if (response.success && response.data?.data) {
        setEntry(mapAPIEntryToJourneyEntry(response.data.data));
      } else {
        if (response.status !== 401) {
          console.error('Failed to load entry:', response.error);
          Alert.alert('Error', response.error || 'Failed to load entry details');
        }
        setEntry(null);
      }
    } catch (error) {
      console.error('Failed to load entry:', error);
      setEntry(null);
      Alert.alert('Error', 'Failed to load entry details');
    } finally {
      setIsLoading(false);
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
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getMoodDescription = (mood?: number) => {
    if (!mood) return '';
    if (mood >= 8) return 'Feeling Great';
    if (mood >= 6) return 'Feeling Good';
    if (mood >= 4) return 'Neutral';
    if (mood >= 2) return 'Feeling Low';
    return 'Very Low';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading entry...</Text>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Entry not found</Text>
        <LMN8Button
          title="Go Back"
          onPress={() => router.back()}
          variant="secondary"
        />
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
        {/* Header with Back Button */}
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={LMN8Colors.text85} />
          </TouchableOpacity>
        </View>

        {/* Entry Header Card */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={[`${getMediaTypeColor(entry.mediaType)}15`, `${getMediaTypeColor(entry.mediaType)}08`]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[
              styles.mediaTypeIconContainer,
              { backgroundColor: `${getMediaTypeColor(entry.mediaType)}20` }
            ]}>
              <Ionicons 
                name={getMediaTypeIcon(entry.mediaType)} 
                size={32} 
                color={getMediaTypeColor(entry.mediaType)} 
              />
            </View>
            
            <Text style={styles.mediaTypeLabel}>{getMediaTypeLabel(entry.mediaType)}</Text>
            <Text style={styles.title}>{entry.title}</Text>
            
            <View style={styles.timestampContainer}>
              <Ionicons name="time-outline" size={16} color={LMN8Colors.text60} />
              <Text style={styles.timestamp}>{formatDate(entry.timestamp)}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Mood Card */}
        {entry.mood && (
          <View style={styles.moodCard}>
            <LinearGradient
              colors={[`${getMoodColor(entry.mood)}15`, `${getMoodColor(entry.mood)}08`]}
              style={styles.moodGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.moodHeader}>
                <Ionicons name="heart-outline" size={20} color={LMN8Colors.text85} />
                <Text style={styles.sectionTitle}>How You Felt</Text>
              </View>
              
              <View style={styles.moodContent}>
                <View style={[
                  styles.moodIconContainer,
                  { backgroundColor: `${getMoodColor(entry.mood)}25` }
                ]}>
                  <Ionicons 
                    name={getMoodIcon(entry.mood)} 
                    size={40} 
                    color={getMoodColor(entry.mood)} 
                  />
                </View>
                <View style={styles.moodDetails}>
                  <Text style={[styles.moodRating, { color: getMoodColor(entry.mood) }]}>
                    {entry.mood}/10
                  </Text>
                  <Text style={styles.moodDescription}>
                    {getMoodDescription(entry.mood)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Content Card */}
        <View style={styles.contentCard}>
          <LinearGradient
            colors={[`${LMN8Colors.container}98`, `${LMN8Colors.container}95`]}
            style={styles.contentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.contentHeader}>
              <Ionicons name="document-text-outline" size={20} color={LMN8Colors.text85} />
              <Text style={styles.sectionTitle}>Your Entry</Text>
            </View>
            <Text style={styles.content}>{entry.content}</Text>
          </LinearGradient>
        </View>

        {/* Transcribed Text Card */}
        {entry.transcribedText && (
          <View style={styles.transcribedCard}>
            <LinearGradient
              colors={[`${LMN8Colors.accentSecondary}15`, `${LMN8Colors.accentSecondary}08`]}
              style={styles.transcribedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.transcribedHeader}>
                <Ionicons name="mic-outline" size={20} color={LMN8Colors.accentSecondary} />
                <Text style={styles.sectionTitle}>Voice Transcription</Text>
              </View>
              <Text style={styles.transcribedText}>{entry.transcribedText}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Media Card */}
        {entry.mediaUrl && (
          <View style={styles.mediaCard}>
            <View style={styles.mediaHeader}>
              <Ionicons name="image-outline" size={20} color={LMN8Colors.text85} />
              <Text style={styles.sectionTitle}>Attached Media</Text>
            </View>
            <View style={styles.mediaContainer}>
              <Image
                source={{ uri: entry.mediaUrl }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            </View>
          </View>
        )}

        {/* Entry Metadata Card */}
        <View style={styles.metadataCard}>
          <LinearGradient
            colors={[`${LMN8Colors.container}90`, `${LMN8Colors.container}85`]}
            style={styles.metadataGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.metadataHeader}>
              <Ionicons name="information-circle-outline" size={20} color={LMN8Colors.text60} />
              <Text style={[styles.sectionTitle, { color: LMN8Colors.text60 }]}>Entry Details</Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Type</Text>
              <View style={styles.metadataValueContainer}>
                <Ionicons name={getMediaTypeIcon(entry.mediaType)} size={16} color={getMediaTypeColor(entry.mediaType)} />
                <Text style={styles.metadataValue}>{getMediaTypeLabel(entry.mediaType)}</Text>
              </View>
            </View>
            
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Created</Text>
              <Text style={styles.metadataValue}>
                {new Date(entry.timestamp).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
            
            <View style={[styles.metadataItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.metadataLabel}>Entry ID</Text>
              <Text style={[styles.metadataValue, { fontSize: 11 }]}>#{entry.id}</Text>
            </View>
          </LinearGradient>
        </View>

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

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LMN8Colors.bgDark,
    padding: LMN8Spacing.xl,
  },

  errorText: {
    ...LMN8Typography.h2,
    color: LMN8Colors.text85,
    marginBottom: LMN8Spacing.xl,
    textAlign: 'center',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: LMN8Spacing.xl,
    paddingTop: 60,
  },

  // Floating background elements
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

  // Header Top
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LMN8Spacing.xl,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${LMN8Colors.container}80`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header Card
  headerCard: {
    marginBottom: LMN8Spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },

  headerGradient: {
    padding: LMN8Spacing.xl,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}20`,
  },

  mediaTypeIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LMN8Spacing.md,
  },

  mediaTypeLabel: {
    ...LMN8Typography.label,
    fontSize: 11,
    fontWeight: '600',
    color: LMN8Colors.text85,
    letterSpacing: 1.5,
    marginBottom: LMN8Spacing.sm,
  },

  title: {
    ...LMN8Typography.h1,
    fontSize: 26,
    fontWeight: '600',
    color: LMN8Colors.text100,
    textAlign: 'center',
    marginBottom: LMN8Spacing.md,
    lineHeight: 36,
  },

  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.xs,
  },

  timestamp: {
    ...LMN8Typography.metadata,
    fontSize: 12,
    color: LMN8Colors.text60,
  },

  // Mood Card
  moodCard: {
    marginBottom: LMN8Spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },

  moodGradient: {
    padding: LMN8Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}15`,
  },

  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.sm,
    marginBottom: LMN8Spacing.md,
  },

  moodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  moodIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.lg,
  },

  moodDetails: {
    flex: 1,
  },

  moodRating: {
    ...LMN8Typography.h2,
    fontSize: 32,
    fontWeight: '600',
    marginBottom: LMN8Spacing.xs,
  },

  moodDescription: {
    ...LMN8Typography.body,
    fontSize: 15,
    fontWeight: '300',
    color: LMN8Colors.text85,
  },

  // Content Card
  contentCard: {
    marginBottom: LMN8Spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },

  contentGradient: {
    padding: LMN8Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}15`,
  },

  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.sm,
    marginBottom: LMN8Spacing.md,
  },

  sectionTitle: {
    ...LMN8Typography.h3,
    fontSize: 17,
    fontWeight: '600',
    color: LMN8Colors.text100,
  },

  content: {
    ...LMN8Typography.body,
    fontSize: 15,
    fontWeight: '300',
    color: LMN8Colors.text85,
    lineHeight: 24,
  },

  // Media Card
  mediaCard: {
    marginBottom: LMN8Spacing.xl,
  },

  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.sm,
    marginBottom: LMN8Spacing.md,
  },

  mediaContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}15`,
  },

  mediaImage: {
    width: '100%',
    height: 240,
  },

  // Transcribed Card
  transcribedCard: {
    marginBottom: LMN8Spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },

  transcribedGradient: {
    padding: LMN8Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentSecondary}20`,
    borderLeftWidth: 3,
    borderLeftColor: LMN8Colors.accentSecondary,
  },

  transcribedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.sm,
    marginBottom: LMN8Spacing.md,
  },

  transcribedText: {
    ...LMN8Typography.body,
    fontSize: 14,
    fontWeight: '300',
    color: LMN8Colors.text85,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Metadata Card
  metadataCard: {
    marginBottom: LMN8Spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },

  metadataGradient: {
    padding: LMN8Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${LMN8Colors.text60}20`,
  },

  metadataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.sm,
    marginBottom: LMN8Spacing.md,
  },

  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: LMN8Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${LMN8Colors.text60}15`,
  },

  metadataLabel: {
    ...LMN8Typography.body,
    fontSize: 13,
    fontWeight: '400',
    color: LMN8Colors.text60,
  },

  metadataValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LMN8Spacing.xs,
  },

  metadataValue: {
    ...LMN8Typography.body,
    fontSize: 13,
    fontWeight: '500',
    color: LMN8Colors.text85,
  },

  bottomPadding: {
    height: 40,
  },
});
