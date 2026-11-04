import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { communityAPI, CommunityPost, CommunityComment } from '@/services/APIService';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [posting, setPosting] = useState(false);

  // Comments state
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    try {
      const res = await communityAPI.getPosts();
      if (res.success && res.data?.data) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      if (isRefresh) setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPosts();
    }, [fetchPosts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(true);
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    setPosting(true);
    try {
      const res = await communityAPI.createPost(newPostText.trim());
      if (res.success && res.data?.data) {
        setPosts([res.data.data, ...posts]);
        setNewPostText('');
        setShowNewPost(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    const prevPost = posts.find(p => p.id === postId);
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
        : p
    ));
    try {
      const res = await communityAPI.toggleLike(postId);
      if (!res.success && prevPost) {
        setPosts(prev => prev.map(p => p.id === postId ? prevPost : p));
      }
    } catch {
      if (prevPost) setPosts(prev => prev.map(p => p.id === postId ? prevPost : p));
    }
  };

  const handleOpenComments = async (post: CommunityPost) => {
    setSelectedPost(post);
    setShowComments(true);
    setCommentsLoading(true);
    try {
      const res = await communityAPI.getComments(post.id);
      if (res.success && res.data?.data) {
        setComments(res.data.data);
      }
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    setCommenting(true);
    try {
      const res = await communityAPI.addComment(selectedPost.id, newComment.trim());
      if (res.success && res.data?.data) {
        setComments([...comments, res.data.data]);
        setPosts(posts.map(p =>
          p.id === selectedPost.id ? { ...p, commentCount: p.commentCount + 1 } : p
        ));
        setNewComment('');
      }
    } catch {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleDeletePost = (post: CommunityPost) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await communityAPI.deletePost(post.id);
            if (res.success) {
              setPosts(prev => prev.filter(p => p.id !== post.id));
            } else {
              Alert.alert('Error', res.error || 'Failed to delete post');
            }
          } catch (err) {
            Alert.alert('Error', 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const currentPatientUserId = (user as any)?.patientUserId;
    const isOwn = item.patientUserId === currentPatientUserId;
    return (
      <View style={styles.postCard}>
        <LinearGradient
          colors={[`${LMN8Colors.container}98`, `${LMN8Colors.container}95`]}
          style={styles.postGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[LMN8Colors.accentPrimary, LMN8Colors.accentSecondary]}
                  style={styles.avatar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>
                    {(item.authorName?.slice(0, 2) || '?').toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{item.authorName || 'Anonymous'}</Text>
                <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
              </View>
            </View>
            {isOwn && (
              <TouchableOpacity onPress={() => handleDeletePost(item)} style={styles.moreButton}>
                <Ionicons name="trash-outline" size={18} color={LMN8Colors.text60} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.postContent}>{item.content}</Text>

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={20}
                color={item.isLiked ? "#ec4899" : LMN8Colors.text60}
              />
              <Text style={[styles.actionText, item.isLiked && styles.actionTextActive]}>
                {item.likeCount || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenComments(item)}>
              <Ionicons name="chatbubble-outline" size={20} color={LMN8Colors.text60} />
              <Text style={styles.actionText}>{item.commentCount || 0}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={LMN8Colors.text100} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Share your journey</Text>
          </View>
          <TouchableOpacity style={styles.newPostButton} onPress={() => setShowNewPost(true)}>
            <Ionicons name="add-circle" size={28} color={LMN8Colors.accentPrimary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={LMN8Colors.accentPrimary} />
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LMN8Colors.accentPrimary} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={64} color={LMN8Colors.text60} />
                <Text style={styles.emptyStateTitle}>No posts yet</Text>
                <Text style={styles.emptyStateText}>
                  Be the first to share your journey with the community!
                </Text>
              </View>
            }
          />
        )}

        {/* New Post Modal */}
        <Modal visible={showNewPost} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity onPress={() => setShowNewPost(false)}>
                  <Ionicons name="close" size={24} color={LMN8Colors.text100} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.postInput}
                placeholder="What's on your mind?"
                placeholderTextColor={LMN8Colors.text60}
                selectionColor={LMN8Colors.accentPrimary}
                keyboardAppearance="dark"
                multiline
                value={newPostText}
                onChangeText={setNewPostText}
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.submitButton, !newPostText.trim() && styles.submitButtonDisabled]}
                onPress={handleCreatePost}
                disabled={posting || !newPostText.trim()}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Comments Modal */}
        <Modal visible={showComments} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comments</Text>
                <TouchableOpacity onPress={() => { setShowComments(false); setSelectedPost(null); }}>
                  <Ionicons name="close" size={24} color={LMN8Colors.text100} />
                </TouchableOpacity>
              </View>

              {selectedPost && (
                <View style={styles.commentPostPreview}>
                  <Text style={styles.commentPostAuthor}>{selectedPost.authorName}</Text>
                  <Text style={styles.commentPostContent} numberOfLines={2}>{selectedPost.content}</Text>
                </View>
              )}

              {commentsLoading ? (
                <ActivityIndicator size="large" color={LMN8Colors.accentPrimary} style={{ marginVertical: 40 }} />
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => String(item.id)}
                  style={styles.commentsList}
                  contentContainerStyle={comments.length === 0 ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : undefined}
                  ListEmptyComponent={
                    <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
                  }
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      <LinearGradient
                        colors={[LMN8Colors.accentPrimary, LMN8Colors.accentSecondary]}
                        style={styles.commentAvatar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.commentAvatarText}>{(item.authorName?.slice(0, 2) || '?').toUpperCase()}</Text>
                      </LinearGradient>
                      <View style={styles.commentBody}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentAuthor}>{item.authorName}</Text>
                          <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
                        </View>
                        <Text style={styles.commentContent}>{item.content}</Text>
                      </View>
                    </View>
                  )}
                />
              )}

              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor={LMN8Colors.text60}
                  selectionColor={LMN8Colors.accentPrimary}
                  keyboardAppearance="dark"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.commentSendButton, !newComment.trim() && styles.submitButtonDisabled]}
                  onPress={handleAddComment}
                  disabled={commenting || !newComment.trim()}
                >
                  {commenting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LMN8Colors.bgDark },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: LMN8Spacing.lg, paddingBottom: LMN8Spacing.md,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: `${LMN8Colors.container}95`,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: `${LMN8Colors.accentPrimary}20`,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { ...LMN8Typography.h2, fontSize: 20, fontWeight: '700', color: LMN8Colors.text100 },
  headerSubtitle: { ...LMN8Typography.caption, fontSize: 12, color: LMN8Colors.text60 },
  newPostButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  feedContent: { paddingHorizontal: LMN8Spacing.lg, paddingBottom: LMN8Spacing.xxl, paddingTop: LMN8Spacing.sm },

  postCard: { marginBottom: LMN8Spacing.lg, borderRadius: 18, overflow: 'hidden' },
  postGradient: { borderRadius: 18, borderWidth: 1, borderColor: `${LMN8Colors.accentPrimary}15`, padding: LMN8Spacing.lg },
  postHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: LMN8Spacing.md },
  authorInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  avatarContainer: { position: 'relative', marginRight: LMN8Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  authorDetails: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '600', color: LMN8Colors.text100 },
  timestamp: { fontSize: 12, color: LMN8Colors.text60, marginTop: 2 },
  moreButton: { padding: 4 },

  postContent: { fontSize: 15, color: LMN8Colors.text100, lineHeight: 22, marginBottom: LMN8Spacing.md },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: LMN8Spacing.lg, paddingTop: LMN8Spacing.sm, borderTopWidth: 1, borderTopColor: `${LMN8Colors.accentPrimary}10` },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontWeight: '600', color: LMN8Colors.text60 },
  actionTextActive: { color: '#ec4899' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120 },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', color: LMN8Colors.text100, marginTop: LMN8Spacing.lg, marginBottom: LMN8Spacing.sm },
  emptyStateText: { fontSize: 14, color: LMN8Colors.text60, textAlign: 'center', paddingHorizontal: LMN8Spacing.xl },

  // New Post Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: LMN8Colors.bgDark, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: LMN8Spacing.lg, height: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: LMN8Spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: LMN8Colors.text100 },
  postInput: {
    backgroundColor: `${LMN8Colors.container}80`, borderRadius: 12, padding: LMN8Spacing.md,
    color: LMN8Colors.text100, fontSize: 15, minHeight: 120, textAlignVertical: 'top',
    borderWidth: 1, borderColor: `${LMN8Colors.accentPrimary}20`,
  },
  submitButton: {
    backgroundColor: LMN8Colors.cta, borderRadius: 12, paddingVertical: LMN8Spacing.md,
    alignItems: 'center', marginTop: LMN8Spacing.md,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Comments Modal
  commentPostPreview: {
    backgroundColor: `${LMN8Colors.container}50`, borderRadius: 12, padding: LMN8Spacing.md,
    marginBottom: LMN8Spacing.md, borderLeftWidth: 3, borderLeftColor: LMN8Colors.accentPrimary,
  },
  commentPostAuthor: { fontSize: 12, fontWeight: '600', color: LMN8Colors.accentPrimary, marginBottom: 4 },
  commentPostContent: { fontSize: 13, color: LMN8Colors.text85, lineHeight: 18 },
  commentsList: { flex: 1, marginBottom: LMN8Spacing.md },
  noCommentsText: { color: LMN8Colors.text60, fontSize: 14, textAlign: 'center' },
  commentItem: { flexDirection: 'row', gap: LMN8Spacing.sm, marginBottom: LMN8Spacing.md },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: LMN8Spacing.sm, marginBottom: 2 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: LMN8Colors.text100 },
  commentTime: { fontSize: 11, color: LMN8Colors.text60 },
  commentContent: { fontSize: 14, color: LMN8Colors.text85, lineHeight: 20 },
  commentInputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: LMN8Spacing.sm,
    borderTopWidth: 1, borderTopColor: `${LMN8Colors.accentPrimary}15`, paddingTop: LMN8Spacing.sm,
  },
  commentInput: {
    flex: 1, backgroundColor: `${LMN8Colors.container}80`, borderRadius: 12, padding: LMN8Spacing.sm,
    color: LMN8Colors.text100, fontSize: 14, maxHeight: 80,
    borderWidth: 1, borderColor: `${LMN8Colors.accentPrimary}20`,
  },
  commentSendButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: LMN8Colors.cta,
    justifyContent: 'center', alignItems: 'center',
  },
});
