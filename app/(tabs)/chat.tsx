import { LMN8Colors, LMN8Spacing, LMN8Typography } from '@/constants/LMN8DesignSystem';
import { useChat } from '@/contexts/ChatContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function ChatScreen() {
  const {
    messages,
    isLoading,
    isCreatingSession,
    sessions,
    currentSessionId,
    activeSessionId,
    sessionSummary,
    sendMessage,
    createNewSession,
    loadSession,
  } = useChat();
  const [inputText, setInputText] = useState('');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const handleHeaderLayout = (e: any) => {
    if (headerHeight === 0) setHeaderHeight(e.nativeEvent.layout.height);
  };

  const handleSendMessage = async () => {
    if (inputText.trim().length === 0) return;

    const message = inputText.trim();
    setInputText('');

    await sendMessage(message);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleNewSession = async () => {
    setInputText('');
    setIsDrawerVisible(false);
    await createNewSession();
  };

  const handleSelectSession = async (sessionId: string) => {
    setInputText('');
    await loadSession(sessionId);
    setIsDrawerVisible(false);
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

      {/* Header */}
      <View onLayout={handleHeaderLayout} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={() => setIsDrawerVisible(true)}
          >
            <View style={styles.hamburgerIcon}>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          </TouchableOpacity>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>AI</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Companion</Text>
            <Text style={styles.headerSubtitle}>Always here to listen and help</Text>
          </View>
          <TouchableOpacity
            style={styles.newSessionButton}
            onPress={handleNewSession}
            disabled={isCreatingSession || isLoading}
          >
            <Text style={styles.newSessionButtonText}>
              {isCreatingSession ? '...' : 'New Chat'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sessionInfoContainer}>
          {currentSessionId ? (
            <>
              {sessionSummary ? (
                <Text style={styles.sessionInfoSummary} numberOfLines={1}>
                  {sessionSummary}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.sessionInfoSummary}>A new chat will be created with your next message.</Text>
          )}
        </View>
      </View>

      <Modal
        visible={isDrawerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDrawerVisible(false)}
      >
        <View style={styles.drawerRoot}>
          <Pressable style={styles.drawerOverlay} onPress={() => setIsDrawerVisible(false)} />
          <View style={[styles.drawerPanel, { paddingTop: insets.top + 16 }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Past Chats</Text>
              <TouchableOpacity onPress={() => setIsDrawerVisible(false)}>
                <Text style={styles.drawerClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.drawerList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.drawerListContent}
            >
              {sessions.length === 0 ? (
                <Text style={styles.drawerEmptyText}>No previous chats yet.</Text>
              ) : (
                sessions.map((session) => (
                  <TouchableOpacity
                    key={session.sessionId}
                    style={[
                      styles.sessionItem,
                      session.sessionId === activeSessionId && styles.sessionItemActive,
                    ]}
                    onPress={() => handleSelectSession(session.sessionId)}
                  >
                    <Text style={styles.sessionItemTitle} numberOfLines={1}>
                      {session.title}
                    </Text>
                    <Text style={styles.sessionItemMeta} numberOfLines={1}>
                      {session.messageCount} messages
                    </Text>
                    {session.summary ? (
                      <Text style={styles.sessionItemSummary} numberOfLines={2}>
                        {session.summary}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={styles.chatBody}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? (headerHeight || 90) : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' ? styles.userText : styles.aiText,
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.role === 'user' ? styles.userTime : styles.aiTime,
                  ]}
                >
                  {formatTime(new Date())}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.typingIndicator}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 4 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor={LMN8Colors.text60}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim().length === 0 && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={inputText.trim().length === 0}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LMN8Colors.bgDark,
  },

  floatingElement1: {
    position: 'absolute',
    top: height * 0.15,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${LMN8Colors.accentPrimary}06`,
    opacity: 0.4,
  },

  floatingElement2: {
    position: 'absolute',
    bottom: height * 0.3,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${LMN8Colors.accentPrimary}04`,
    opacity: 0.3,
  },

  header: {
    paddingHorizontal: LMN8Spacing.lg,
    paddingBottom: LMN8Spacing.md,
    backgroundColor: `${LMN8Colors.container}95`,
    borderBottomWidth: 1,
    borderBottomColor: `${LMN8Colors.accentPrimary}20`,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  hamburgerButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}45`,
    backgroundColor: `${LMN8Colors.accentPrimary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: LMN8Spacing.sm,
  },

  hamburgerIcon: {
    width: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2.5,
  },

  hamburgerLine: {
    width: 14,
    height: 2,
    borderRadius: 2,
    backgroundColor: LMN8Colors.text100,
  },

  aiAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${LMN8Colors.accentPrimary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LMN8Spacing.md,
  },

  aiAvatarText: {
    fontSize: 24,
  },

  headerText: {
    flex: 1,
  },

  newSessionButton: {
    backgroundColor: `${LMN8Colors.accentPrimary}25`,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}45`,
    borderRadius: 12,
    paddingHorizontal: LMN8Spacing.sm,
    paddingVertical: 6,
  },

  newSessionButtonText: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text100,
    fontSize: 11,
    fontWeight: '700',
  },

  headerTitle: {
    ...LMN8Typography.h3,
    fontSize: 18,
    fontWeight: '600',
    color: LMN8Colors.text100,
    marginBottom: 2,
  },

  headerSubtitle: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text60,
    fontSize: 12,
  },

  sessionInfoContainer: {
    marginTop: LMN8Spacing.sm,
    paddingTop: LMN8Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: `${LMN8Colors.accentPrimary}15`,
  },

  sessionInfoTitle: {
    ...LMN8Typography.metadata,
    color: LMN8Colors.accentPrimary,
    fontSize: 11,
    marginBottom: 2,
  },

  sessionInfoSummary: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text85,
    fontSize: 11,
  },

  chatBody: {
    flex: 1,
  },

  drawerRoot: {
    flex: 1,
    flexDirection: 'row',
  },

  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  drawerPanel: {
    width: Math.min(width * 0.82, 340),
    backgroundColor: `${LMN8Colors.container}F8`,
    borderLeftWidth: 1,
    borderLeftColor: `${LMN8Colors.accentPrimary}25`,
    paddingHorizontal: LMN8Spacing.md,
    paddingBottom: LMN8Spacing.lg,
  },

  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LMN8Spacing.md,
  },

  drawerTitle: {
    ...LMN8Typography.h3,
    color: LMN8Colors.text100,
    fontSize: 18,
    fontWeight: '600',
  },

  drawerClose: {
    ...LMN8Typography.caption,
    color: LMN8Colors.accentPrimary,
    fontWeight: '700',
  },

  drawerList: {
    flex: 1,
  },

  drawerListContent: {
    paddingBottom: LMN8Spacing.xl,
  },

  drawerEmptyText: {
    ...LMN8Typography.body,
    color: LMN8Colors.text60,
    marginTop: LMN8Spacing.md,
  },

  sessionItem: {
    backgroundColor: `${LMN8Colors.bgDark}A8`,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}25`,
    borderRadius: 14,
    padding: LMN8Spacing.md,
    marginBottom: LMN8Spacing.sm,
  },

  sessionItemActive: {
    borderColor: `${LMN8Colors.accentPrimary}75`,
    backgroundColor: `${LMN8Colors.accentPrimary}16`,
  },

  sessionItemTitle: {
    ...LMN8Typography.label,
    color: LMN8Colors.text100,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },

  sessionItemMeta: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text60,
    fontSize: 11,
    marginBottom: 4,
  },

  sessionItemSummary: {
    ...LMN8Typography.caption,
    color: LMN8Colors.text85,
    fontSize: 12,
    lineHeight: 16,
  },

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    padding: LMN8Spacing.lg,
    paddingBottom: LMN8Spacing.md,
  },

  messageContainer: {
    marginBottom: LMN8Spacing.md,
  },

  userMessage: {
    alignItems: 'flex-end',
  },

  aiMessage: {
    alignItems: 'flex-start',
  },

  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: LMN8Spacing.md,
    paddingVertical: LMN8Spacing.sm,
    borderRadius: 20,
  },

  userBubble: {
    backgroundColor: LMN8Colors.accentPrimary,
    borderBottomRightRadius: 4,
  },

  aiBubble: {
    backgroundColor: `${LMN8Colors.container}95`,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}20`,
  },

  messageText: {
    ...LMN8Typography.body,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },

  userText: {
    color: '#ffffff',
  },

  aiText: {
    color: LMN8Colors.text100,
  },

  messageTime: {
    ...LMN8Typography.caption,
    fontSize: 11,
  },

  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  aiTime: {
    color: LMN8Colors.text60,
  },

  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LMN8Colors.accentPrimary,
    marginHorizontal: 2,
    opacity: 0.6,
  },

  inputContainer: {
    paddingHorizontal: LMN8Spacing.lg,
    paddingTop: LMN8Spacing.sm,
    backgroundColor: `${LMN8Colors.container}95`,
    borderTopWidth: 1,
    borderTopColor: `${LMN8Colors.accentPrimary}20`,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: `${LMN8Colors.bgDark}80`,
    borderRadius: 25,
    paddingHorizontal: LMN8Spacing.md,
    paddingVertical: LMN8Spacing.sm,
    borderWidth: 1,
    borderColor: `${LMN8Colors.accentPrimary}30`,
  },

  textInput: {
    flex: 1,
    ...LMN8Typography.body,
    color: LMN8Colors.text100,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: LMN8Spacing.sm,
  },

  sendButton: {
    backgroundColor: LMN8Colors.cta,
    paddingHorizontal: LMN8Spacing.md,
    paddingVertical: LMN8Spacing.sm,
    borderRadius: 20,
    marginLeft: LMN8Spacing.sm,
  },

  sendButtonDisabled: {
    backgroundColor: LMN8Colors.text60,
    opacity: 0.5,
  },

  sendButtonText: {
    ...LMN8Typography.label,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});


