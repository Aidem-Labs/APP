import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/APIService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HomeworkStatus = 'assigned' | 'completed' | 'not_understood';
type Homework = { id: number | string; title?: string | null; type?: string | null; content?: string | null; transcript?: string | null; status?: HomeworkStatus | null; created_at?: string | null; };

export default function HomeworkScreen() {
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [notUnderstoodIds, setNotUnderstoodIds] = useState<Set<number | string>>(new Set());

  const loadHomeworks = useCallback(async (refresh = false) => {
    if (!user?.id) { setHomeworks([]); setLoading(false); return; }
    if (refresh) { setRefreshing(true); } else { setLoading(true); }
    const personKey = user.userType === 'student' ? 'studentId' : 'patientId';
    const response = await api.get<{ homeworks?: Homework[] }>('/api/homework?' + personKey + '=' + encodeURIComponent(user.id));
    if (response.success) {
      const items = Array.isArray(response.data?.homeworks) ? response.data.homeworks : [];
      setHomeworks([...items].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
    } else if (!refresh) Alert.alert('Could not load homework', response.error || 'Please try again.');
    setLoading(false); setRefreshing(false);
  }, [user?.id, user?.userType]);

  useFocusEffect(useCallback(() => { loadHomeworks(); }, [loadHomeworks]));

  const updateStatus = async (homework: Homework, status: Exclude<HomeworkStatus, 'assigned'>) => {
    setUpdatingId(homework.id);
    const response = await api.patch<{ homework?: Homework }>('/api/homework', { id: homework.id, status });
    setUpdatingId(null);
    if (!response.success || !response.data?.homework) { Alert.alert('Update failed', response.error || 'Please try again.'); return; }
    setHomeworks(items => items.map(item => item.id === homework.id ? response.data!.homework! : item));
    if (status === 'not_understood') {
      setNotUnderstoodIds(ids => new Set(ids).add(homework.id));
    } else {
      setNotUnderstoodIds(ids => { const next = new Set(ids); next.delete(homework.id); return next; });
    }
  };

  return <View style={styles.container}>
    <LinearGradient colors={[LMN8Colors.bgDark, '#edf2f2', LMN8Colors.bgDark]} style={StyleSheet.absoluteFill} />
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHomeworks(true)} tintColor={LMN8Colors.accentPrimary} />}>
      <View style={styles.header}><Text style={styles.title}>Homework</Text><Text style={styles.subtitle}>Your latest assigned homework appears first.</Text></View>
      {loading ? <View style={styles.empty}><ActivityIndicator size="large" color={LMN8Colors.accentPrimary} /></View> : homeworks.length === 0 ? <View style={styles.empty}><Ionicons name="book-outline" size={38} color={LMN8Colors.accentPrimary} /><Text style={styles.emptyTitle}>No homework assigned</Text><Text style={styles.emptyText}>New homework from your care team will appear here.</Text></View> : homeworks.map(homework => {
        const completed = homework.status === 'completed'; const updating = updatingId === homework.id;
        const instructions = homework.content || homework.transcript || (homework.type === 'voice' ? 'Voice homework assigned.' : 'No instructions provided.');
        return <View key={String(homework.id)} style={styles.card}>
          <View style={styles.top}><View style={styles.icon}><Ionicons name="clipboard-outline" size={20} color={LMN8Colors.accentPrimary} /></View><View style={styles.heading}><Text style={styles.cardTitle}>{homework.title || 'Homework'}</Text><Text style={styles.date}>{homework.created_at ? 'Assigned ' + new Date(homework.created_at).toLocaleDateString() : 'Recently assigned'}</Text></View>{completed && <View style={styles.completed}><Ionicons name="checkmark" size={14} color="#fff" /><Text style={styles.completedText}>Completed</Text></View>}</View>
          <Text style={styles.instructions}>{instructions}</Text>
          {(homework.status === 'not_understood' || notUnderstoodIds.has(homework.id)) && <Text style={styles.note}>You marked this homework as not understood. It will remain pending until you mark it completed.</Text>}
          {!completed && <View style={styles.actions}><TouchableOpacity disabled={updating} onPress={() => updateStatus(homework, 'not_understood')} style={styles.secondary}><Text style={styles.secondaryText}>{updating ? 'Updating...' : 'Not understood'}</Text></TouchableOpacity><TouchableOpacity disabled={updating} onPress={() => updateStatus(homework, 'completed')} style={styles.primary}><Ionicons name="checkmark-circle-outline" size={18} color="#fff" /><Text style={styles.primaryText}>Mark as completed</Text></TouchableOpacity></View>}
        </View>;
      })}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LMN8Colors.bgDark }, content: { padding: LMN8Spacing.lg, paddingTop: 58, paddingBottom: 120 }, header: { marginBottom: LMN8Spacing.xl }, title: { ...LMN8Typography.h1, fontSize: 32, fontWeight: '800' }, subtitle: { ...LMN8Typography.body, marginTop: 4, color: LMN8Colors.text60 },
  empty: { minHeight: 260, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }, emptyTitle: { ...LMN8Typography.h3, marginTop: 16, fontSize: 20 }, emptyText: { ...LMN8Typography.body, textAlign: 'center', marginTop: 6, color: LMN8Colors.text60 },
  card: { backgroundColor: LMN8Colors.container, borderWidth: 1, borderColor: '#17706e26', borderRadius: 16, padding: LMN8Spacing.lg, marginBottom: LMN8Spacing.md }, top: { flexDirection: 'row', alignItems: 'center' }, icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#17706e1f', justifyContent: 'center', alignItems: 'center', marginRight: 10 }, heading: { flex: 1 }, cardTitle: { ...LMN8Typography.body, fontSize: 17, fontWeight: '700', color: LMN8Colors.text100 }, date: { ...LMN8Typography.caption, fontSize: 12, marginTop: 2 }, instructions: { ...LMN8Typography.body, color: LMN8Colors.text85, marginTop: 16, lineHeight: 23 },
  completed: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#10b981', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 }, completedText: { fontSize: 11, fontWeight: '700', color: '#fff' }, note: { ...LMN8Typography.caption, fontSize: 12, color: '#fbbf24', marginTop: 12 }, actions: { flexDirection: 'row', gap: 10, marginTop: 18 }, secondary: { flex: 1, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: '#fbbf24', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }, secondaryText: { fontSize: 13, fontWeight: '700', color: '#fbbf24', textAlign: 'center' }, primary: { flex: 1.25, minHeight: 44, borderRadius: 10, backgroundColor: LMN8Colors.cta, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingHorizontal: 8 }, primaryText: { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center' },
});