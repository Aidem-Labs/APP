
import { LMN8Button } from '@/components/ui/LMN8Button';
import { LMN8BorderRadius, LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface JourneyEntry {
  id: string;
  title: string;
  content: string;
  mediaType: 'text' | 'photo' | 'handwritten';
  mediaUrl?: string;
  transcribedText?: string;
  timestamp: string;
  mood?: number;
}

export default function JourneyLogScreen() {
  const router = useRouter();
  const { databaseService } = useDatabase();
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      // TODO: Load entries from database
      // For now, using mock data
      const mockEntries: JourneyEntry[] = [
        {
          id: '1',
          title: 'Morning Reflection',
          content: 'Feeling grateful for the new day. The sun is shining and I feel hopeful.',
          mediaType: 'text',
          timestamp: new Date().toISOString(),
          mood: 8,
        },
        {
          id: '2',
          title: 'Journal Entry',
          content: 'Working through some anxiety today. Taking deep breaths helps.',
          mediaType: 'handwritten',
          mediaUrl: 'mock-url',
          transcribedText: 'Working through some anxiety today. Taking deep breaths helps.',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          mood: 5,
        },
      ];
      setEntries(mockEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
      Alert.alert('Error', 'Failed to load your journey entries');
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

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'text': return '📝';
      case 'photo': return '📷';
      case 'handwritten': return '✍️';
      default: return '📄';
    }
  };

  const getMediaTypeLabel = (mediaType: string) => {
    switch (mediaType) {
      case 'text': return 'Text Entry';
      case 'photo': return 'Photo';
      case 'handwritten': return 'Handwritten';
      default: return 'Entry';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return '';
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😔';
    return '😢';
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Journey Log</Text>
        <Text style={styles.subtitle}>Your therapeutic journey captured in time</Text>
      </View>

      {/* New Entry Button */}
      <View style={styles.newEntryContainer}>
        <LMN8Button
          title="+ New Entry"
          onPress={handleNewEntry}
          size="large"
          fullWidth
        />
      </View>

      {/* Entries List */}
      <ScrollView style={styles.entriesContainer} showsVerticalScrollIndicator={false}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📖</Text>
            <Text style={styles.emptyStateTitle}>Start Your Journey</Text>
            <Text style={styles.emptyStateText}>
              Create your first entry to begin documenting your therapeutic journey
            </Text>
            <LMN8Button
              title="Create First Entry"
              onPress={handleNewEntry}
              variant="secondary"
              size="medium"
            />
          </View>
        ) : (
          entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => handleEntryPress(entry)}
            >
              <View style={styles.entryHeader}>
                <View style={styles.mediaTypeContainer}>
                  <Text style={styles.mediaTypeIcon}>
                    {getMediaTypeIcon(entry.mediaType)}
                  </Text>
                  <Text style={styles.mediaTypeLabel}>
                    {getMediaTypeLabel(entry.mediaType)}
                  </Text>
                </View>
                <Text style={styles.timestamp}>{formatDate(entry.timestamp)}</Text>
              </View>

              <Text style={styles.entryTitle}>{entry.title}</Text>
              
              {entry.content && (
                <Text style={styles.entryContent} numberOfLines={3}>
                  {entry.content}
                </Text>
              )}

              {entry.transcribedText && (
                <View style={styles.transcribedContainer}>
                  <Text style={styles.transcribedLabel}>Transcribed:</Text>
                  <Text style={styles.transcribedText} numberOfLines={2}>
                    {entry.transcribedText}
                  </Text>
                </View>
              )}

              <View style={styles.entryFooter}>
                {entry.mood && (
                  <View style={styles.moodContainer}>
                    <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                    <Text style={styles.moodText}>Mood: {entry.mood}/10</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LMN8Colors.bgDark,
  },
  loadingText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
  },
  header: {
    padding: LMN8Spacing.xl,
    paddingTop: LMN8Spacing.xxl,
    backgroundColor: LMN8Colors.container,
    marginBottom: LMN8Spacing.lg,
  },
  title: {
    ...LMN8Typography.h1,
    color: LMN8Colors.accentPrimary,
    marginBottom: LMN8Spacing.sm,
  },
  subtitle: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
  },
  newEntryContainer: {
    paddingHorizontal: LMN8Spacing.lg,
    marginBottom: LMN8Spacing.lg,
  },
  entriesContainer: {
    flex: 1,
    paddingHorizontal: LMN8Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: LMN8Spacing.xxl,
    marginTop: LMN8Spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: LMN8Spacing.lg,
  },
  emptyStateTitle: {
    ...LMN8Typography.h2,
    textAlign: 'center',
    marginBottom: LMN8Spacing.sm,
  },
  emptyStateText: {
    ...LMN8Typography.body,
    textAlign: 'center',
    color: LMN8Colors.text60,
    marginBottom: LMN8Spacing.xl,
    lineHeight: 24,
  },
  entryCard: {
    backgroundColor: LMN8Colors.container,
    borderRadius: LMN8BorderRadius.lg,
    padding: LMN8Spacing.lg,
    marginBottom: LMN8Spacing.md,
    shadowColor: LMN8Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LMN8Spacing.md,
  },
  mediaTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaTypeIcon: {
    fontSize: 20,
    marginRight: LMN8Spacing.sm,
  },
  mediaTypeLabel: {
    ...LMN8Typography.label,
    color: LMN8Colors.accentSecondary,
  },
  timestamp: {
    ...LMN8Typography.metadata,
    color: LMN8Colors.text60,
  },
  entryTitle: {
    ...LMN8Typography.h3,
    marginBottom: LMN8Spacing.sm,
  },
  entryContent: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
    lineHeight: 24,
    marginBottom: LMN8Spacing.md,
  },
  transcribedContainer: {
    backgroundColor: LMN8Colors.bgLight,
    padding: LMN8Spacing.md,
    borderRadius: LMN8BorderRadius.md,
    marginBottom: LMN8Spacing.md,
  },
  transcribedLabel: {
    ...LMN8Typography.label,
    color: LMN8Colors.accentSecondary,
    marginBottom: LMN8Spacing.xs,
  },
  transcribedText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text85,
    fontStyle: 'italic',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: LMN8Spacing.xs,
  },
  moodText: {
    ...LMN8Typography.metadata,
    color: LMN8Colors.text60,
  },
});
