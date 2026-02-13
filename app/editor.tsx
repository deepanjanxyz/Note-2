import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { RichTextToolbar } from '@/components/RichTextToolbar';
import { AIPanel } from '@/components/AIPanel';
import { GlassCard } from '@/components/GlassCard';
import {
  Note,
  getAllNotes,
  saveNote,
  generateId,
  categorizeNote,
} from '@/lib/storage';

export default function EditorScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const { noteId } = useLocalSearchParams<{ noteId: string }>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [hasBullets, setHasBullets] = useState(false);
  const [hasHighlight, setHasHighlight] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [category, setCategory] = useState('General');
  const [existingNote, setExistingNote] = useState<Note | null>(null);
  const [saved, setSaved] = useState(false);
  const titleRef = useRef<TextInput>(null);
  const contentRef = useRef<TextInput>(null);

  useEffect(() => {
    if (noteId) {
      loadNote(noteId);
    } else {
      setTimeout(() => titleRef.current?.focus(), 300);
    }
  }, [noteId]);

  async function loadNote(id: string) {
    const notes = await getAllNotes();
    const note = notes.find(n => n.id === id);
    if (note) {
      setExistingNote(note);
      setTitle(note.title);
      setContent(note.content);
      setIsBold(note.isBold);
      setIsItalic(note.isItalic);
      setHasBullets(note.hasBullets);
      setHasHighlight(note.hasHighlight);
      setCategory(note.category);
    }
  }

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      router.back();
      return;
    }

    const cat = categorizeNote(title, content);
    const now = Date.now();
    const note: Note = {
      id: existingNote?.id || generateId(),
      title: title.trim(),
      content: content.trim(),
      category: cat,
      createdAt: existingNote?.createdAt || now,
      updatedAt: now,
      isBold,
      isItalic,
      hasBullets,
      hasHighlight,
    };

    await saveNote(note);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSaved(true);
    setTimeout(() => {
      router.back();
    }, 300);
  }, [title, content, isBold, isItalic, hasBullets, hasHighlight, existingNote]);

  function handleApplyAIText(text: string) {
    setContent(text);
    setShowAI(false);
  }

  function handleBack() {
    if ((title.trim() || content.trim()) && !saved) {
      if (Platform.OS === 'web') {
        handleSave();
      } else {
        Alert.alert('Save Note?', 'Do you want to save your changes?', [
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
          { text: 'Save', onPress: handleSave },
        ]);
      }
    } else {
      router.back();
    }
  }

  const contentFontStyle = {
    fontWeight: isBold ? ('bold' as const) : ('normal' as const),
    fontStyle: isItalic ? ('italic' as const) : ('normal' as const),
    backgroundColor: hasHighlight ? Colors.dark.highlight : 'transparent',
  };

  const processedContent = hasBullets && content
    ? content
        .split('\n')
        .map(line => {
          if (line.trim() && !line.startsWith('\u2022 ')) {
            return '\u2022 ' + line;
          }
          return line;
        })
        .join('\n')
    : content;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.dark.text} />
        </Pressable>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowAI(!showAI)}
            style={[styles.aiBtn, showAI && styles.aiBtnActive]}
          >
            <MaterialCommunityIcons
              name="robot"
              size={20}
              color={showAI ? Colors.dark.accent : Colors.dark.textSecondary}
            />
          </Pressable>
          <Pressable onPress={handleSave} style={styles.saveBtn}>
            <Ionicons name="checkmark" size={22} color={Colors.dark.background} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: insets.bottom + webBottomInset + 100 }]}
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryRow}>
          <View style={[styles.catBadge, { backgroundColor: Colors.dark.accentDim }]}>
            <Ionicons name="folder-outline" size={12} color={Colors.dark.accent} />
            <Text style={styles.catText}>{category}</Text>
          </View>
          <Text style={styles.dateText}>
            {existingNote
              ? new Date(existingNote.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'New Note'}
          </Text>
        </View>

        <TextInput
          ref={titleRef}
          style={styles.titleInput}
          placeholder="Note title..."
          placeholderTextColor={Colors.dark.textMuted}
          value={title}
          onChangeText={setTitle}
          multiline
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
          blurOnSubmit
        />

        <View style={styles.toolbarRow}>
          <RichTextToolbar
            isBold={isBold}
            isItalic={isItalic}
            hasBullets={hasBullets}
            hasHighlight={hasHighlight}
            onToggleBold={() => setIsBold(!isBold)}
            onToggleItalic={() => setIsItalic(!isItalic)}
            onToggleBullets={() => setHasBullets(!hasBullets)}
            onToggleHighlight={() => setHasHighlight(!hasHighlight)}
          />
        </View>

        <GlassCard style={styles.editorCard}>
          <TextInput
            ref={contentRef}
            style={[styles.contentInput, contentFontStyle]}
            placeholder="Start writing..."
            placeholderTextColor={Colors.dark.textMuted}
            value={hasBullets ? processedContent : content}
            onChangeText={(text) => {
              if (hasBullets) {
                const cleaned = text
                  .split('\n')
                  .map(line => line.replace(/^\u2022\s?/, ''))
                  .join('\n');
                setContent(cleaned);
              } else {
                setContent(text);
              }
            }}
            multiline
            textAlignVertical="top"
            autoCorrect
            scrollEnabled={false}
          />
        </GlassCard>

        {showAI && (
          <AIPanel
            noteContent={content}
            onApplyText={handleApplyAIText}
            onClose={() => setShowAI(false)}
          />
        )}

        {saved && (
          <View style={styles.savedIndicator}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.dark.success} />
            <Text style={styles.savedText}>Saved</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.glass,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
  },
  aiBtnActive: {
    backgroundColor: Colors.dark.accentDim,
    borderColor: Colors.dark.accent,
  },
  saveBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  catText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.accent,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  titleInput: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    marginBottom: 16,
    padding: 0,
    lineHeight: 32,
  },
  toolbarRow: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  editorCard: {
    minHeight: 200,
  },
  contentInput: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    lineHeight: 24,
    minHeight: 180,
    padding: 0,
  },
  savedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
  },
  savedText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.success,
  },
});
